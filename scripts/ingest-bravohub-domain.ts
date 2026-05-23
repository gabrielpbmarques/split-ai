/**
 * Ingest BravoHub domain knowledge (selected `.claude/skills/*` from the
 * bravohub-analytics repo) into Supabase pgvector with source_type='bravohub-domain'.
 *
 * Usage:
 *   bun run scripts/ingest-bravohub-domain.ts
 *
 * Idempotent. Re-run after editing the source skills.
 *
 * Env: same as ingest-bravohub-schema.ts plus optional
 *   BRAVOHUB_SKILLS_DIR (defaults to ../bravohub-analytics/.claude/skills)
 */
import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

import { ingestDocs, IngestDoc } from './lib/voyage-ingest';

dotenv.config();

const SOURCE_TYPE = 'bravohub-domain';
const CHUNK_TARGET_CHARS = 1800;

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

function chunkMarkdown(content: string): string[] {
  const sections: string[] = [];
  const blocks = content.split(/(?=^##\s)/m);
  for (const block of blocks) {
    if (block.length <= CHUNK_TARGET_CHARS) {
      sections.push(block.trim());
      continue;
    }
    const paragraphs = block.split(/\n\n+/);
    let buf = '';
    for (const p of paragraphs) {
      if ((buf + '\n\n' + p).length > CHUNK_TARGET_CHARS && buf) {
        sections.push(buf.trim());
        buf = p;
      } else {
        buf = buf ? `${buf}\n\n${p}` : p;
      }
    }
    if (buf) sections.push(buf.trim());
  }
  return sections.filter((s) => s.length > 50);
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const embeddingModel = process.env.EMBEDDING_MODEL;
  const voyageApiKey = process.env.VOYAGEAI_API_KEY;
  if (!supabaseUrl || !supabaseKey) throw new Error('Supabase env vars ausentes');
  if (!embeddingModel) throw new Error('EMBEDDING_MODEL ausente');
  if (!voyageApiKey) throw new Error('VOYAGEAI_API_KEY ausente');

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

  const docs: IngestDoc[] = [];
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
      docs.push({
        pageContent: `SOURCE: ${skillName}\n\n${chunk}`,
        metadata: {
          source_type: SOURCE_TYPE,
          source_id: `bravohub-domain-2026-05-20`,
          source_name: skillName,
          chunk_index: idx,
        },
      });
    }
  }
  if (docs.length === 0) {
    console.error('Nenhum documento encontrado. Verifique BRAVOHUB_SKILLS_DIR.');
    process.exit(1);
  }

  await ingestDocs({
    docs,
    supabaseClient,
    embeddingModel,
    outputDimension: 1024,
    apiKey: voyageApiKey,
  });
  console.log('Ingestão de domínio concluída.');
}

void main().catch((err) => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
