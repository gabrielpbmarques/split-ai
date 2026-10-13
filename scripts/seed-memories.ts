import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { argv, exit, stderr, stdout } from 'node:process';

import { PostgresStore } from '@langchain/langgraph-checkpoint-postgres/store';
import pg from 'pg';

import { env } from 'src/shared/config/env';

interface FileEntry {
  readonly fullPath: string;
  readonly relPath: string;
  readonly birthtime: Date;
  readonly mtime: Date;
}

const SUPPORTED_EXTENSIONS = new Set([
  '.md',
  '.markdown',
  '.txt',
  '.json',
  '.yaml',
  '.yml',
  '.ts',
  '.js',
]);

function detectMimeType(filePath: string): string {
  if (filePath.endsWith('.json')) return 'application/json';
  if (filePath.endsWith('.txt')) return 'text/plain';
  if (filePath.endsWith('.yaml') || filePath.endsWith('.yml'))
    return 'application/x-yaml';
  if (filePath.endsWith('.ts') || filePath.endsWith('.js'))
    return 'text/javascript';
  return 'text/markdown';
}

function collectFiles(dir: string, base: string = ''): readonly FileEntry[] {
  try {
    const list = readdirSync(dir);
    let results: FileEntry[] = [];
    for (const file of list) {
      if (file.startsWith('.')) continue;
      const fullPath = join(dir, file);
      const relPath = base ? `${base}/${file}` : file;
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        results = results.concat(collectFiles(fullPath, relPath));
      } else {
        const ext = file.slice(file.lastIndexOf('.')).toLowerCase();
        if (SUPPORTED_EXTENSIONS.has(ext)) {
          results.push({
            fullPath,
            relPath,
            birthtime: stat.birthtime,
            mtime: stat.mtime,
          });
        }
      }
    }
    return results;
  } catch {
    return [];
  }
}

async function run(): Promise<void> {
  const targetAgentIdentifier = argv[2]?.trim().toLowerCase();

  const pool = new pg.Pool({ connectionString: env.DATABASE_URL });
  const client = await pool.connect();

  try {
    const allAgentsResult = await client.query(
      'SELECT id, agent_identifier FROM agents WHERE deleted_at IS NULL',
    );

    const allAgentIdentifiers = new Set(
      allAgentsResult.rows
        .map((r) => r.agent_identifier?.toLowerCase())
        .filter(Boolean),
    );

    const targetAgents = targetAgentIdentifier
      ? allAgentsResult.rows.filter(
          (r) => r.agent_identifier?.toLowerCase() === targetAgentIdentifier,
        )
      : allAgentsResult.rows;

    if (targetAgents.length === 0) {
      stdout.write(
        targetAgentIdentifier
          ? `Nenhum agente encontrado com o identificador '${targetAgentIdentifier}'.\n`
          : 'Nenhum agente ativo encontrado no banco.\n',
      );
      return;
    }

    const store = PostgresStore.fromConnString(env.DATABASE_URL);
    await store.setup();

    for (const agent of targetAgents) {
      const identifier = agent.agent_identifier;
      const agentId = agent.id;

      const memoriesNamespace = ['memories', agentId, 'filesystem'];
      const skillsNamespace = ['skills', agentId, 'filesystem'];
      const scratchpadNamespace = ['scratchpad', agentId, 'filesystem'];

      const memoriesDir = join(process.cwd(), 'memories', identifier);
      const memoryFiles = collectFiles(memoriesDir);

      for (const { fullPath, relPath, birthtime, mtime } of memoryFiles) {
        const content = readFileSync(fullPath, 'utf-8');
        const fileData = {
          content,
          mimeType: detectMimeType(relPath),
          created_at: birthtime.toISOString(),
          modified_at: mtime.toISOString(),
        };

        const scopedKey = `/${identifier}/${relPath}`;
        await store.put(memoriesNamespace, scopedKey, fileData);

        const rootKey = `/${relPath}`;
        await store.put(memoriesNamespace, rootKey, fileData);
      }

      const skillsDir = join(process.cwd(), 'skills', identifier);
      const skillFiles = collectFiles(skillsDir);

      for (const { fullPath, relPath, birthtime, mtime } of skillFiles) {
        const content = readFileSync(fullPath, 'utf-8');
        const fileData = {
          content,
          mimeType: detectMimeType(relPath),
          created_at: birthtime.toISOString(),
          modified_at: mtime.toISOString(),
        };

        const scopedKey = `/${identifier}/${relPath}`;
        await store.put(skillsNamespace, scopedKey, fileData);

        const rootKey = `/${relPath}`;
        await store.put(skillsNamespace, rootKey, fileData);
      }

      const sharedSkillsDir = join(process.cwd(), 'skills', 'shared');
      const sharedSkillFiles = collectFiles(sharedSkillsDir);

      for (const { fullPath, relPath, birthtime, mtime } of sharedSkillFiles) {
        const content = readFileSync(fullPath, 'utf-8');
        const fileData = {
          content,
          mimeType: detectMimeType(relPath),
          created_at: birthtime.toISOString(),
          modified_at: mtime.toISOString(),
        };

        const sharedKey = `/shared/${relPath}`;
        await store.put(skillsNamespace, sharedKey, fileData);

        const rootKey = `/${relPath}`;
        await store.put(skillsNamespace, rootKey, fileData);
      }

      const globalSkillsDir = join(process.cwd(), 'skills');
      const globalSkillFiles = collectFiles(globalSkillsDir).filter((f) => {
        const firstSegment = f.relPath.split('/')[0]?.toLowerCase();
        if (firstSegment === 'shared') return false;
        if (allAgentIdentifiers.has(firstSegment)) return false;
        return true;
      });

      for (const { fullPath, relPath, birthtime, mtime } of globalSkillFiles) {
        const content = readFileSync(fullPath, 'utf-8');
        const fileData = {
          content,
          mimeType: detectMimeType(relPath),
          created_at: birthtime.toISOString(),
          modified_at: mtime.toISOString(),
        };

        const rootKey = `/${relPath}`;
        await store.put(skillsNamespace, rootKey, fileData);
      }

      const agentScratchpadDir = join(process.cwd(), 'scratchpad', identifier);
      const agentScratchpadFiles = collectFiles(agentScratchpadDir);

      if (agentScratchpadFiles.length > 0) {
        for (const { fullPath, relPath, birthtime, mtime } of agentScratchpadFiles) {
          const content = readFileSync(fullPath, 'utf-8');
          const fileData = {
            content,
            mimeType: detectMimeType(relPath),
            created_at: birthtime.toISOString(),
            modified_at: mtime.toISOString(),
          };

          const rootKey = `/${relPath}`;
          await store.put(scratchpadNamespace, rootKey, fileData);
        }
      } else {
        const defaultNotesPath = join(process.cwd(), 'scratchpad', 'notes.md');
        const now = new Date().toISOString();
        const initialContent = existsSync(defaultNotesPath)
          ? readFileSync(defaultNotesPath, 'utf-8')
          : `# Scratchpad - ${identifier}\n`;

        await store.put(scratchpadNamespace, '/notes.md', {
          content: initialContent,
          mimeType: 'text/markdown',
          created_at: now,
          modified_at: now,
        });
      }

      stdout.write(
        `Agente '${identifier}' (${agentId}): ${memoryFiles.length} memórias, ${skillFiles.length + sharedSkillFiles.length + globalSkillFiles.length} skills e scratchpad sincronizados no store.\n`,
      );
    }
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((error) => {
  stderr.write(`Falha ao sincronizar memórias: ${String(error)}\n`);
  exit(1);
});
