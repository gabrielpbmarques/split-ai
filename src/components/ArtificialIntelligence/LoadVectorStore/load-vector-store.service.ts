import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { VertexAIEmbeddings } from '@langchain/google-vertexai';
import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from 'src/infrastructure/providers/supabase.provider';
import { VERTEX_AI_EMBEDDINGS } from 'src/infrastructure/providers/vertex-ai.provider';
import { CustomMetadata } from 'src/types';

@Injectable()
export class LoadVectorStoreService {
  constructor(
    @Inject(VERTEX_AI_EMBEDDINGS) private embeddings: VertexAIEmbeddings,
    @Inject(SUPABASE_CLIENT) private supabaseClient: SupabaseClient,
  ) {}

  async execute(filter: CustomMetadata): Promise<SupabaseVectorStore> {
    const { source_type, agent_id } = filter;
    const vectorStore = await SupabaseVectorStore.fromExistingIndex(
      this.embeddings,
      {
        client: this.supabaseClient,
        tableName: 'documents',
        queryName: 'match_documents',
        filter: {
          source_type,
          agent_id,
        },
      },
    );

    return vectorStore;
  }
}
