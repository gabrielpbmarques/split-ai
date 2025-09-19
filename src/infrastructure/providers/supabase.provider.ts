import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { Document } from '@langchain/core/documents';
import { VertexAIEmbeddings } from '@langchain/google-vertexai';
import { Inject, Provider } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from 'src/config';
import { Chunks, CustomMetadata } from 'src/types';
import { cleanInvalidUnicode } from 'src/utils/clearInvalidUnicode';

import { VERTEX_AI_EMBEDDINGS } from './vertex-ai.provider';

export const SUPABASE_CLIENT = 'SUPABASE_CLIENT';

export class SupabaseService {
  constructor(
    @Inject(VERTEX_AI_EMBEDDINGS)
    private readonly embeddings: VertexAIEmbeddings,
    private readonly supabaseClient: SupabaseClient,
  ) {
    this.supabaseClient = createClient(config.supabaseUrl, config.supabaseKey);
  }

  async createVectorStore(docs: Chunks, metadata: CustomMetadata) {
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

    const vectorStore = await SupabaseVectorStore.fromDocuments(
      chunks,
      this.embeddings,
      {
        client: this.supabaseClient,
        tableName: 'documents',
        queryName: 'match_documents',
        filter: metadata,
      },
    );

    return vectorStore;
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
      embeddings: VertexAIEmbeddings,
      supabaseClient: SupabaseClient,
    ): SupabaseService => {
      return new SupabaseService(embeddings, supabaseClient);
    },
    inject: [VERTEX_AI_EMBEDDINGS, SUPABASE_CLIENT],
  },
];
