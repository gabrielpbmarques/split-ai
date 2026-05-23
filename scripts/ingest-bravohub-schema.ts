/**
 * Ingest the bravohub_application MySQL schema into Supabase pgvector
 * (`documents` table, source_type='mysql-schema'), one chunk per CREATE TABLE
 * — with sub-chunking for tables whose DDL exceeds the embedding model's
 * input window (~512 tokens for mxbai-embed-large).
 *
 * Usage:
 *   bun run scripts/ingest-bravohub-schema.ts
 *
 * Idempotent: deletes prior rows matching (source_type='mysql-schema') before
 * inserting fresh.
 *
 * Required env (loaded from .env via dotenv):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY   (service-role key recommended)
 *   EMBEDDING_MODEL                  (e.g., mxbai-embed-large)
 *   OLLAMA_BASE_URL                  (e.g., http://localhost:11434)
 */
import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { OllamaEmbeddings } from '@langchain/ollama';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { Document } from 'langchain';

dotenv.config();

const SCHEMA_PATH = resolve(__dirname, '../data/schema/bravohub-database.sql');
const SOURCE_TYPE = 'mysql-schema';
// mxbai-embed-large has a 512-token input window. MySQL DDL is dense
// (backticks/symbols → ~2 chars/token worst case), so cap chunks ≤ 1000 chars
// (~330–500 tokens) to leave a safety margin.
const MAX_CHUNK_CHARS = 1000;

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

/**
 * Split a table's DDL into pieces ≤ MAX_CHUNK_CHARS, keeping the column-row
 * lines intact and prepending a common header so retrieval from any chunk
 * still resolves to the right table.
 */
function chunkTable(tableName: string, ddl: string, columns: string[]): string[] {
  const header = [
    `TABLE: ${tableName}`,
    `COLUMNS: ${columns.join(', ')}`,
    '',
  ].join('\n');

  const fullContent = `${header}${ddl}`;
  if (fullContent.length <= MAX_CHUNK_CHARS) {
    return [fullContent];
  }

  const ddlLines = ddl.split('\n');
  const chunks: string[] = [];
  let buf = header;
  for (const line of ddlLines) {
    const candidate = `${buf}${line}\n`;
    if (candidate.length > MAX_CHUNK_CHARS && buf.length > header.length) {
      chunks.push(buf.trimEnd());
      buf = `${header}${line}\n`;
    } else {
      buf = candidate;
    }
  }
  if (buf.length > header.length) chunks.push(buf.trimEnd());
  return chunks;
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const embeddingModel = process.env.EMBEDDING_MODEL;
  const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  if (!supabaseUrl || !supabaseKey) throw new Error('Supabase env vars ausentes');
  if (!embeddingModel) throw new Error('EMBEDDING_MODEL ausente');

  const stats = statSync(SCHEMA_PATH);
  const sourceId = `bravohub-schema-${stats.mtime.toISOString().slice(0, 10)}`;
  console.log(`Lendo dump: ${SCHEMA_PATH} (${stats.size} bytes)`);
  console.log(`source_id: ${sourceId}`);
  console.log(`Ollama: ${ollamaBaseUrl}  modelo: ${embeddingModel}`);

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

  const documents: Document[] = [];
  for (const { tableName, ddl } of tables) {
    const columns = extractColumns(ddl);
    const chunks = chunkTable(tableName, ddl, columns);
    chunks.forEach((content, idx) => {
      documents.push(
        new Document({
          pageContent: content,
          metadata: {
            source_type: SOURCE_TYPE,
            source_id: sourceId,
            table_name: tableName,
            column_count: columns.length,
            chunk_index: idx,
            chunk_total: chunks.length,
          },
        }),
      );
    });
  }
  console.log(`${documents.length} chunks gerados (média ${(documents.length / tables.length).toFixed(2)} por tabela).`);

  const embeddings = new OllamaEmbeddings({
    model: embeddingModel,
    baseUrl: ollamaBaseUrl,
    // Safety net: if a chunk somehow exceeds the model's context, let Ollama
    // truncate silently instead of failing the whole batch.
    truncate: true,
  });

  const longest = documents.reduce(
    (m, d) => Math.max(m, d.pageContent.length),
    0,
  );
  console.log(`Maior chunk: ${longest} chars.`);
  console.log('Embeddings + insert via SupabaseVectorStore.fromDocuments...');
  await SupabaseVectorStore.fromDocuments(documents, embeddings, {
    client: supabaseClient as unknown as any,
    tableName: 'documents',
    queryName: 'match_documents',
  });

  console.log('Ingestão concluída.');
}

void main().catch((err) => {
  console.error('Erro fatal na ingestão:', err);
  process.exit(1);
});
