/**
 * Bypasses LangChain's VoyageEmbeddings.embedDocuments (which fires all
 * batches via Promise.all and breaks on Voyage's 3 RPM free tier — see
 * split-ai/CLAUDE.md note on the masked 429). Sends one batch at a time
 * and inserts directly into the Supabase `documents` table.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

const VOYAGE_API_URL = 'https://api.voyageai.com/v1/embeddings';
const DEFAULT_BATCH_SIZE = 8; // Voyage hard cap is 8 inputs per request.
const DEFAULT_DELAY_MS = 21_000; // 3 RPM → 1 request every 20s, +1s safety.

export type IngestDoc = {
  pageContent: string;
  metadata: Record<string, unknown>;
};

export type IngestArgs = {
  docs: IngestDoc[];
  supabaseClient: SupabaseClient;
  embeddingModel: string;
  outputDimension: number;
  apiKey: string;
  inputType?: 'document' | 'query';
  batchSize?: number;
  delayMs?: number;
  tableName?: string;
};

type VoyageEmbeddingResponse = {
  data: Array<{ embedding: number[] }>;
};

export async function ingestDocs(args: IngestArgs): Promise<void> {
  const {
    docs,
    supabaseClient,
    embeddingModel,
    outputDimension,
    apiKey,
  } = args;
  const inputType = args.inputType ?? 'document';
  const batchSize = args.batchSize ?? DEFAULT_BATCH_SIZE;
  const delayMs = args.delayMs ?? DEFAULT_DELAY_MS;
  const tableName = args.tableName ?? 'documents';

  if (docs.length === 0) {
    console.log('Nada para ingerir.');
    return;
  }

  const batches: IngestDoc[][] = [];
  for (let i = 0; i < docs.length; i += batchSize) {
    batches.push(docs.slice(i, i + batchSize));
  }

  const etaSeconds = ((batches.length - 1) * delayMs) / 1000;
  console.log(
    `Processando ${batches.length} batch(es) de até ${batchSize}, ` +
      `respeitando rate limit (~${delayMs / 1000}s entre batches). ` +
      `ETA mínimo: ${etaSeconds.toFixed(0)}s.`,
  );

  const startedAt = Date.now();
  for (let i = 0; i < batches.length; i += 1) {
    const batch = batches[i];
    const response = await fetch(VOYAGE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: embeddingModel,
        input: batch.map((d) => d.pageContent),
        input_type: inputType,
        output_dimension: outputDimension,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(
        `Voyage API ${response.status} no batch ${i + 1}/${batches.length}: ${errText.slice(0, 300)}`,
      );
    }
    const result = (await response.json()) as VoyageEmbeddingResponse;
    if (!Array.isArray(result.data) || result.data.length !== batch.length) {
      throw new Error(
        `Voyage retornou ${result.data?.length ?? 0} embeddings para ${batch.length} inputs no batch ${i + 1}.`,
      );
    }

    const rows = batch.map((doc, idx) => ({
      content: doc.pageContent,
      embedding: result.data[idx].embedding,
      metadata: doc.metadata,
    }));
    const { error } = await supabaseClient.from(tableName).insert(rows);
    if (error) {
      throw new Error(
        `Supabase insert falhou no batch ${i + 1}/${batches.length}: ${error.message}`,
      );
    }

    const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
    console.log(
      `  [${elapsed}s] batch ${i + 1}/${batches.length} OK (${batch.length} docs)`,
    );

    if (i < batches.length - 1) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}
