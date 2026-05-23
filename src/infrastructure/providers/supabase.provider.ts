import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { Embeddings } from '@langchain/core/embeddings';
import { Inject, Provider } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Document } from 'langchain';
import { config } from 'src/config';
import { Chunks, CustomMetadata } from 'src/types';
import { cleanInvalidUnicode } from 'src/utils/clearInvalidUnicode';

import { EMBEDDINGS } from './ollama-embeddings.provider';

export const SUPABASE_CLIENT = 'SUPABASE_CLIENT';

export class SupabaseService {
  constructor(
    @Inject(EMBEDDINGS)
    private readonly embeddings: Embeddings,
    @Inject(SUPABASE_CLIENT)
    private readonly supabaseClient: SupabaseClient,
  ) {}

  async createVectorStore(
    docs: Chunks,
    metadata: CustomMetadata,
  ): Promise<number> {
    const chunks = docs.map(
      (rawChunk) =>
        new Document({
          pageContent: cleanInvalidUnicode(
            rawChunk.pageContent || rawChunk.content,
          ),
          metadata: {
            ...rawChunk.metadata,
            ...metadata,
          },
        }),
    );

    await SupabaseVectorStore.fromDocuments(chunks, this.embeddings, {
      client: this.supabaseClient as unknown as any,
      tableName: 'documents',
      queryName: 'match_documents',
      filter: metadata,
    });

    return chunks.length;
  }
}

export const SUPABASE_SERVICE = 'SUPABASE_SERVICE';

export const SupabaseProvider: Provider[] = [
  {
    provide: SUPABASE_CLIENT,
    useFactory: (): SupabaseClient => {
      const supabaseUrl = config.supabaseUrl;
      const supabaseKey = config.supabaseKey;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase URL and key must be provided');
      }

      return createClient(supabaseUrl, supabaseKey as string);
    },
  },
  {
    provide: SUPABASE_SERVICE,
    useFactory: (
      embeddings: Embeddings,
      supabaseClient: SupabaseClient,
    ): SupabaseService => {
      return new SupabaseService(embeddings, supabaseClient);
    },
    inject: [EMBEDDINGS, SUPABASE_CLIENT],
  },
];
