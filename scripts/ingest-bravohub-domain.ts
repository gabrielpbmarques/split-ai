/**
 * Ingest BravoHub domain knowledge (selected `.claude/skills/*` from the
 * bravohub-analytics repo) into Supabase pgvector with source_type='bravohub-domain'.
 *
 * Usage:
 *   bun run scripts/ingest-bravohub-domain.ts
 *
 * Idempotent. Re-run after editing the source skills.
 *
 * Env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   EMBEDDING_MODEL                 (e.g., mxbai-embed-large)
 *   OLLAMA_BASE_URL                 (e.g., http://localhost:11434)
 *   BRAVOHUB_SKILLS_DIR             (defaults to ../bravohub-analytics/.claude/skills)
 */
import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { OllamaEmbeddings } from '@langchain/ollama';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { Document } from 'langchain';

dotenv.config();

const SOURCE_TYPE = 'bravohub-domain';
// mxbai-embed-large has a 512-token input window. Portuguese prose tokenizes
// at ~3 chars/token; capping at 1000 chars keeps chunks comfortably under 350
// tokens with margin for stop-word overhead.
const CHUNK_TARGET_CHARS = 1000;

const SKILLS_TO_INGEST = [
  'campaigns-overview',
  'campaign-rex',
  'campaign-sale',
  'campaign-affiliates',
  'campaign-discount',
  'gamification',
  'participant-hierarchies',
  'events',
  'calculate-pontos-vendedores',
  'calculate-pontos-gerentes',
  'calculate-pontos-gestores',
  'login-code-2fa',
];

/**
 * Hierarchical split: section (## heading) → paragraph (\n\n) → line (\n) →
 * hard char slice. The line-level split is essential for content like
 * markdown tables or long bullet lists that have no blank lines between rows.
 */
function packBySeparator(units: string[], sep: string): string[] {
  const out: string[] = [];
  let buf = '';
  for (const u of units) {
    const candidate = buf ? `${buf}${sep}${u}` : u;
    if (candidate.length > CHUNK_TARGET_CHARS && buf) {
      out.push(buf);
      buf = u;
    } else {
      buf = candidate;
    }
  }
  if (buf) out.push(buf);
  return out;
}

function hardSlice(text: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < text.length; i += CHUNK_TARGET_CHARS) {
    out.push(text.slice(i, i + CHUNK_TARGET_CHARS));
  }
  return out;
}

function splitOversized(unit: string, level: 'paragraph' | 'line'): string[] {
  if (unit.length <= CHUNK_TARGET_CHARS) return [unit];
  if (level === 'paragraph') {
    const lines = unit.split('\n');
    const packed = packBySeparator(lines, '\n');
    // If any packed line-group is still over the cap, hard-slice it.
    return packed.flatMap((p) => (p.length > CHUNK_TARGET_CHARS ? hardSlice(p) : [p]));
  }
  return hardSlice(unit);
}

function chunkMarkdown(content: string): string[] {
  const sections: string[] = [];
  const blocks = content.split(/(?=^##\s)/m);
  for (const block of blocks) {
    if (block.length <= CHUNK_TARGET_CHARS) {
      sections.push(block.trim());
      continue;
    }
    const paragraphs = block.split(/\n\n+/).flatMap((p) => splitOversized(p, 'paragraph'));
    for (const piece of packBySeparator(paragraphs, '\n\n')) {
      sections.push(piece.trim());
    }
  }
  return sections.filter((s) => s.length > 50);
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const embeddingModel = process.env.EMBEDDING_MODEL;
  const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  if (!supabaseUrl || !supabaseKey) throw new Error('Supabase env vars ausentes');
  if (!embeddingModel) throw new Error('EMBEDDING_MODEL ausente');

  const skillsDir =
    process.env.BRAVOHUB_SKILLS_DIR ||
    resolve(__dirname, '../../bravohub-analytics/.claude/skills');

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
  for (const skillName of SKILLS_TO_INGEST) {
    const path = resolve(skillsDir, skillName, 'SKILL.md');
    let content: string;
    try {
      statSync(path);
      content = readFileSync(path, 'utf-8');
    } catch {
      console.warn(`(aviso) skill não encontrada: ${path}`);
      continue;
    }
    const chunks = chunkMarkdown(content);
    console.log(`  ${skillName}: ${chunks.length} chunks`);
    for (const [idx, chunk] of chunks.entries()) {
      documents.push(
        new Document({
          pageContent: `SOURCE: ${skillName}\n\n${chunk}`,
          metadata: {
            source_type: SOURCE_TYPE,
            source_id: `bravohub-domain-2026-05-23`,
            source_name: skillName,
            chunk_index: idx,
          },
        }),
      );
    }
  }
  if (documents.length === 0) {
    console.error('Nenhum documento encontrado. Verifique BRAVOHUB_SKILLS_DIR.');
    process.exit(1);
  }

  console.log(`Ollama: ${ollamaBaseUrl}  modelo: ${embeddingModel}`);
  const embeddings = new OllamaEmbeddings({
    model: embeddingModel,
    baseUrl: ollamaBaseUrl,
    // Safety net: if a chunk exceeds the model's context, let Ollama truncate
    // silently instead of failing the whole batch.
    truncate: true,
  });

  const longest = documents.reduce(
    (m, d) => Math.max(m, d.pageContent.length),
    0,
  );
  console.log(`Maior chunk: ${longest} chars.`);
  console.log(`Embeddings + insert de ${documents.length} chunks...`);
  await SupabaseVectorStore.fromDocuments(documents, embeddings, {
    client: supabaseClient as unknown as any,
    tableName: 'documents',
    queryName: 'match_documents',
  });

  console.log('Ingestão de domínio concluída.');
}

void main().catch((err) => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
