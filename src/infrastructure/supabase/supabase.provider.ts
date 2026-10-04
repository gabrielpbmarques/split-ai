import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { Embeddings } from '@langchain/core/embeddings';
import { Inject, Provider } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Document } from 'langchain';

import {
  SUPABASE_CLIENT,
  SUPABASE_SERVICE,
} from 'src/infrastructure/supabase/supabase.tokens';
import { VOYAGE_EMBEDDINGS } from 'src/infrastructure/voyage-embeddings/voyage-embeddings.tokens';
import { env } from 'src/shared/config/env';
import { Chunks, CustomMetadata } from 'src/shared/contracts';
import { cleanInvalidUnicode } from 'src/shared/utils/clear-invalid-unicode';

export class SupabaseService {
  constructor(
    @Inject(VOYAGE_EMBEDDINGS)
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

export const SupabaseProvider: Provider[] = [
  {
    provide: SUPABASE_CLIENT,
    useFactory: (): SupabaseClient => {
      const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
    inject: [VOYAGE_EMBEDDINGS, SUPABASE_CLIENT],
  },
];
