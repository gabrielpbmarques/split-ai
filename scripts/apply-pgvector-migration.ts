/**
 * Applies migrations/create_documents_pgvector.sql against DATABASE_URL.
 *
 * Run once per Supabase project (idempotent — re-running is a no-op).
 *
 * Usage:
 *   bun run scripts/apply-pgvector-migration.ts
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { Client } from 'pg';

/**
 * Reads DATABASE_URL directly from the .env file as raw text, bypassing any
 * dotenv-style `$VAR` expansion that mangles `$` characters in passwords.
 * See split-ai/CLAUDE.md note on bun's .env loader.
 */
function readDatabaseUrlRaw(): string {
  const envPath = resolve(__dirname, '../.env');
  const text = readFileSync(envPath, 'utf-8');
  for (const line of text.split('\n')) {
    const match = line.match(/^\s*DATABASE_URL\s*=\s*(.*)$/);
    if (!match) continue;
    let value = match[1].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    return value;
  }
  throw new Error('DATABASE_URL não encontrado em .env');
}

async function main() {
  const url = readDatabaseUrlRaw();

  const sqlPath = resolve(__dirname, '../migrations/create_documents_pgvector.sql');
  const sql = readFileSync(sqlPath, 'utf-8');

  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    console.log('Aplicando migration de pgvector...');
    await client.query(sql);
    const { rows } = await client.query<{
      table_name: string;
      column_name: string;
      data_type: string;
    }>(
      `SELECT column_name, data_type
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'documents'
       ORDER BY ordinal_position`,
    );
    console.log('Colunas da tabela documents:');
    for (const r of rows) {
      console.log(`  ${r.column_name.padEnd(12)} ${r.data_type}`);
    }
    const { rows: fnRows } = await client.query<{ proname: string }>(
      `SELECT proname FROM pg_proc WHERE proname = 'match_documents'`,
    );
    console.log(`Função match_documents: ${fnRows.length > 0 ? 'OK' : 'AUSENTE'}`);
  } finally {
    await client.end();
  }
  console.log('Migration aplicada.');
}

void main().catch((err) => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
