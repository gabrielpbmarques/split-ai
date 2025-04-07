import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { VertexAIEmbeddings } from '@langchain/google-vertexai';
import { SupabaseClient } from '@supabase/supabase-js';
import { Injectable } from '@nestjs/common';
import { CustomMetadata } from 'src/types/CustomMetadata';

@Injectable()
export class LoadVectorStoreService {
  constructor(
    private embeddings: VertexAIEmbeddings,
    private supabaseClient: SupabaseClient,
  ) {}

  async execute(filter: CustomMetadata): Promise<SupabaseVectorStore> {
    const vectorStore = await SupabaseVectorStore.fromExistingIndex(
      this.embeddings,
      {
        client: this.supabaseClient,
        tableName: 'documents',
        queryName: 'match_documents',
        filter: filter,
      },
    );

    return vectorStore;
  }
}
