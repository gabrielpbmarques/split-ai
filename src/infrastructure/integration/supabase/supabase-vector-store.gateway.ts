import {
  type SupabaseLibArgs,
  SupabaseVectorStore,
} from '@langchain/community/vectorstores/supabase';
import type { Embeddings } from '@langchain/core/embeddings';
import type { VectorStoreInterface } from '@langchain/core/vectorstores';
import { Logger } from '@nestjs/common';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Document } from 'langchain';

import {
  type IntegrationState,
  notConfigured,
} from 'src/infrastructure/integration/integration.state';
import type { VectorStoreGateway } from 'src/infrastructure/integration/vector-store.port';
import { env } from 'src/shared/config/env';
import type { Chunks, CustomMetadata } from 'src/shared/contracts';
import { cleanInvalidUnicode } from 'src/shared/utils/clear-invalid-unicode';

const TABLE_NAME = 'documents';
const QUERY_NAME = 'match_documents';

export class SupabaseVectorStoreGateway implements VectorStoreGateway {
  readonly name = 'supabase';

  private readonly logger = new Logger(SupabaseVectorStoreGateway.name);
  private readonly client?: SupabaseClient;

  constructor(private readonly embeddings: Embeddings) {
    if (env.SUPABASE_URL && env.SUPABASE_SECRET_KEY) {
      this.client = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY);
    }
  }

  state(): IntegrationState {
    return this.client ? 'READY' : 'NOT_CONFIGURED';
  }

  async upsertChunks(
    chunks: Chunks,
    metadata: CustomMetadata,
  ): Promise<number> {
    const client = this.client ?? notConfigured(this.name);

    const documents = (chunks as ReadonlyArray<Chunks[number]>).map(
      (chunk) =>
        new Document({
          pageContent: cleanInvalidUnicode(
            (chunk as { pageContent?: string }).pageContent ||
              (chunk as { content?: string }).content ||
              '',
          ),
          metadata: { ...(chunk.metadata ?? {}), ...metadata },
        }),
    );

    await SupabaseVectorStore.fromDocuments(documents, this.embeddings, {
      client: client as unknown as SupabaseLibArgs['client'],
      tableName: TABLE_NAME,
      queryName: QUERY_NAME,
      filter: metadata,
    });

    return documents.length;
  }

  async loadIndex(filter: CustomMetadata): Promise<VectorStoreInterface> {
    const client = this.client ?? notConfigured(this.name);

    const store = await SupabaseVectorStore.fromExistingIndex(this.embeddings, {
      client: client as unknown as SupabaseLibArgs['client'],
      tableName: TABLE_NAME,
      queryName: QUERY_NAME,
      filter,
    });

    return store as unknown as VectorStoreInterface;
  }

  async deleteBySourceId(sourceId: string): Promise<void> {
    const client = this.client ?? notConfigured(this.name);

    const { error } = await client
      .from(TABLE_NAME)
      .delete()
      .eq('metadata->>source_id', sourceId);

    if (error) {
      this.logger.error(
        `Falha ao apagar documentos da fonte ${sourceId}: ${error.message}`,
      );
      throw new Error(error.message);
    }
  }
}
