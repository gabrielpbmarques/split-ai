import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory';
import {
  type SupabaseLibArgs,
  SupabaseVectorStore,
} from '@langchain/community/vectorstores/supabase';
import type { Embeddings } from '@langchain/core/embeddings';
import type { VectorStoreInterface } from '@langchain/core/vectorstores';
import {
  Logger,
  type Provider,
  ServiceUnavailableException,
} from '@nestjs/common';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Document } from 'langchain';

import { EMBEDDINGS_SERVICE } from 'src/infrastructure/providers/voyage.provider';
import { env } from 'src/shared/config/env';
import type { Chunks, CustomMetadata } from 'src/shared/contracts';
import { cleanInvalidUnicode } from 'src/shared/utils/clear-invalid-unicode';

export const SUPABASE_CLIENT = 'SUPABASE_CLIENT';
export const VECTOR_STORE_SERVICE = 'VECTOR_STORE_SERVICE';

export interface IVectorStoreService {
  upsertChunks(chunks: Chunks, metadata: CustomMetadata): Promise<number>;
  loadIndex(filter: CustomMetadata): Promise<VectorStoreInterface>;
  deleteBySourceId(sourceId: string): Promise<void>;
}

const TABLE_NAME = 'documents';
const QUERY_NAME = 'match_documents';

class SupabaseVectorStoreService implements IVectorStoreService {
  private readonly logger = new Logger(SupabaseVectorStoreService.name);

  constructor(
    private readonly client: SupabaseClient | null,
    private readonly embeddings: Embeddings,
  ) {}

  async upsertChunks(
    chunks: Chunks,
    metadata: CustomMetadata,
  ): Promise<number> {
    if (!this.client) {
      throw new ServiceUnavailableException('Supabase não configurado');
    }

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
      client: this.client as unknown as SupabaseLibArgs['client'],
      tableName: TABLE_NAME,
      queryName: QUERY_NAME,
      filter: metadata,
    });

    return documents.length;
  }

  async loadIndex(filter: CustomMetadata): Promise<VectorStoreInterface> {
    if (!this.client) {
      throw new ServiceUnavailableException('Supabase não configurado');
    }

    const store = await SupabaseVectorStore.fromExistingIndex(this.embeddings, {
      client: this.client as unknown as SupabaseLibArgs['client'],
      tableName: TABLE_NAME,
      queryName: QUERY_NAME,
      filter,
    });

    return store as unknown as VectorStoreInterface;
  }

  async deleteBySourceId(sourceId: string): Promise<void> {
    if (!this.client) {
      throw new ServiceUnavailableException('Supabase não configurado');
    }

    const { error } = await this.client
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

class MockVectorStoreService implements IVectorStoreService {
  private readonly documents: Document<Record<string, unknown>>[] = [];

  constructor(private readonly embeddings: Embeddings) {}

  async upsertChunks(
    chunks: Chunks,
    metadata: CustomMetadata,
  ): Promise<number> {
    const documents = (chunks as ReadonlyArray<Chunks[number]>).map(
      (chunk) =>
        new Document({
          pageContent:
            (chunk as { pageContent?: string }).pageContent ||
            (chunk as { content?: string }).content ||
            '',
          metadata: { ...(chunk.metadata ?? {}), ...metadata },
        }),
    );

    this.documents.push(...documents);

    return documents.length;
  }

  async loadIndex(filter: CustomMetadata): Promise<VectorStoreInterface> {
    const matching = this.documents.filter((document) =>
      Object.entries(filter).every(
        ([key, value]) =>
          value === undefined || document.metadata[key] === value,
      ),
    );

    return MemoryVectorStore.fromDocuments(matching, this.embeddings);
  }

  async deleteBySourceId(sourceId: string): Promise<void> {
    for (let i = this.documents.length - 1; i >= 0; i -= 1) {
      if (this.documents[i].metadata.source_id === sourceId) {
        this.documents.splice(i, 1);
      }
    }
  }
}

export const SupabaseProvider: Provider[] = [
  {
    provide: SUPABASE_CLIENT,
    useFactory: (): SupabaseClient | null => {
      if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
        return null;
      }
      return createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY);
    },
  },
  {
    provide: VECTOR_STORE_SERVICE,
    useFactory: (
      client: SupabaseClient | null,
      embeddings: Embeddings,
    ): IVectorStoreService => {
      if (env.INTEGRATION_MODE === 'mock') {
        return new MockVectorStoreService(embeddings);
      }
      return new SupabaseVectorStoreService(client, embeddings);
    },
    inject: [SUPABASE_CLIENT, EMBEDDINGS_SERVICE],
  },
];
