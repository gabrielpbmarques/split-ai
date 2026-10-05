/**
 * Deletes a corrupted LangGraph checkpoint so a thread poisoned by a dangling
 * `tool_use` (a run that died after the tool call was persisted but before its
 * `tool_result`) can chat again. Every LangGraph turn on the same
 * `thread_id = ${conversation_id ?? session_id}` replays that broken history,
 * which Anthropic rejects with a 400 until the checkpoint is cleared.
 *
 *   bun run repair:thread                     # clears the default poisoned thread
 *   bun run repair:thread <threadId> [...]    # clears the given thread(s)
 *
 * Run it through the `repair:thread` npm script (ts-node + CommonJS), NOT
 * directly via bun's ESM loader (PC-006 in docs/problemas-conhecidos.md).
 *
 * This is a manual hotfix for threads already corrupted. New corruption is
 * prevented at runtime by the `sanitize-tool-call-history` middleware in
 * ResolveAgent, which strips dangling tool calls before every model call.
 * Deleting the checkpoint loses that session's conversation memory (it was
 * already unusable); the underlying chat messages in the `messages` table are
 * untouched.
 */
import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { env } from 'src/shared/config/env';

// The thread flagged in the LangSmith trace. Override via argv.
const DEFAULT_THREAD_IDS = [
  '20e899ea-d201-43cf-be2b-8780a3b4dcc4',
];

// LangGraph PostgresSaver tables, in FK-safe delete order (writes/blobs first).
const CHECKPOINT_TABLES = [
  'checkpoint_writes',
  'checkpoint_blobs',
  'checkpoints',
];

async function main() {
  const threadIds = process.argv.slice(2).filter(Boolean);
  const targets = threadIds.length ? threadIds : DEFAULT_THREAD_IDS;

  const dataSource = new DataSource({
    type: 'postgres',
    url: env.DATABASE_URL,
  });
  await dataSource.initialize();

  try {
    for (const threadId of targets) {
      console.log(`\nThread: ${threadId}`);

      let total = 0;
      const deleted: Record<string, number> = {};
      for (const table of CHECKPOINT_TABLES) {
        const [{ count }] = await dataSource.query(
          `SELECT COUNT(*)::int AS count FROM ${table} WHERE thread_id = $1`,
          [threadId],
        );
        total += count;
        if (count > 0) {
          const result = await dataSource.query(
            `DELETE FROM ${table} WHERE thread_id = $1`,
            [threadId],
          );
          // pg driver returns [rows, affectedCount] for DELETE.
          deleted[table] = Array.isArray(result) ? (result[1] ?? count) : count;
        } else {
          deleted[table] = 0;
        }
      }

      if (total === 0) {
        console.log('  no checkpoint rows found (already clean or wrong id).');
      } else {
        for (const table of CHECKPOINT_TABLES) {
          console.log(`  ${table}: deleted ${deleted[table]}`);
        }
      }
    }
    console.log('\nDone.');
  } finally {
    await dataSource.destroy();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
