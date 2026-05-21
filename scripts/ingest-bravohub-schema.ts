/**
 * Ingest the bravohub_application MySQL schema into Supabase pgvector
 * (`documents` table, source_type='mysql-schema'), one chunk per CREATE TABLE.
 *
 * Usage:
 *   bun run scripts/ingest-bravohub-schema.ts
 *
 * Idempotent: deletes prior rows matching (source_type='mysql-schema',
 * source_id=<version>) before inserting fresh.
 *
 * Required env (loaded from .env via dotenv):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY   (service-role key recommended)
 *   EMBEDDING_MODEL                  (e.g., voyage-3-large)
 *   VOYAGEAI_API_KEY
 */
import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

import { ingestDocs } from './lib/voyage-ingest';

dotenv.config();

const SCHEMA_PATH = resolve(__dirname, '../data/schema/bravohub-database.sql');
const SOURCE_TYPE = 'mysql-schema';

function parseTables(dump: string): { tableName: string; ddl: string }[] {
  const blocks: { tableName: string; ddl: string }[] = [];
  const lines = dump.split('\n');
  let inBlock = false;
  let currentName: string | null = null;
  let currentLines: string[] = [];

  const startRe = /^\s*CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"]?([a-zA-Z0-9_]+)[`"]?/i;
  const endRe = /^\s*\)\s*ENGINE.*?;\s*$/i;
  const altEndRe = /^\s*\)\s*;\s*$/;

  for (const line of lines) {
    if (!inBlock) {
      const m = line.match(startRe);
      if (m) {
        inBlock = true;
        currentName = m[1];
        currentLines = [line];
      }
      continue;
    }
    currentLines.push(line);
    if (endRe.test(line) || altEndRe.test(line)) {
      if (currentName) {
        blocks.push({ tableName: currentName, ddl: currentLines.join('\n') });
      }
      inBlock = false;
      currentName = null;
      currentLines = [];
    }
  }
  return blocks;
}

function extractColumns(ddl: string): string[] {
  const columns: string[] = [];
  const colRe = /^\s*[`"]?([a-zA-Z_][a-zA-Z0-9_]*)[`"]?\s+(int|bigint|tinyint|smallint|mediumint|float|double|decimal|varchar|char|text|mediumtext|longtext|datetime|timestamp|date|time|json|enum|set|blob|binary)/i;
  for (const line of ddl.split('\n')) {
    const m = line.match(colRe);
    if (m && !/^\s*(KEY|INDEX|PRIMARY|UNIQUE|CONSTRAINT|FOREIGN)/i.test(line)) {
      columns.push(m[1]);
    }
  }
  return columns;
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const embeddingModel = process.env.EMBEDDING_MODEL;
  const voyageApiKey = process.env.VOYAGEAI_API_KEY;
  if (!supabaseUrl || !supabaseKey) throw new Error('Supabase env vars ausentes');
  if (!embeddingModel) throw new Error('EMBEDDING_MODEL ausente');
  if (!voyageApiKey) throw new Error('VOYAGEAI_API_KEY ausente');

  const stats = statSync(SCHEMA_PATH);
  const sourceId = `bravohub-schema-${stats.mtime.toISOString().slice(0, 10)}`;
  console.log(`Lendo dump: ${SCHEMA_PATH} (${stats.size} bytes)`);
  console.log(`source_id: ${sourceId}`);

  const dump = readFileSync(SCHEMA_PATH, 'utf-8');
  const tables = parseTables(dump);
  console.log(`${tables.length} tabelas encontradas.`);

  const supabaseClient = createClient(supabaseUrl, supabaseKey);

  console.log(`Removendo chunks anteriores com source_type='${SOURCE_TYPE}'...`);
  const { error: delErr } = await supabaseClient
    .from('documents')
    .delete()
    .eq('metadata->>source_type', SOURCE_TYPE);
  if (delErr) {
    console.warn(`(aviso) falha ao deletar chunks antigos: ${delErr.message}`);
  }

  const docs = tables.map(({ tableName, ddl }) => {
    const columns = extractColumns(ddl);
    const content = [
      `TABLE: ${tableName}`,
      `COLUMNS: ${columns.join(', ')}`,
      '',
      ddl,
    ].join('\n');
    return {
      pageContent: content,
      metadata: {
        source_type: SOURCE_TYPE,
        source_id: sourceId,
        table_name: tableName,
        column_count: columns.length,
      },
    };
  });

  await ingestDocs({
    docs,
    supabaseClient,
    embeddingModel,
    outputDimension: 1024,
    apiKey: voyageApiKey,
  });

  console.log('Ingestão concluída.');
}

void main().catch((err) => {
  console.error('Erro fatal na ingestão:', err);
  process.exit(1);
});
