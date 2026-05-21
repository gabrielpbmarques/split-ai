import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { Embeddings } from '@langchain/core/embeddings';
import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from 'src/infrastructure/providers/supabase.provider';
import { VOYAGE_EMBEDDINGS } from 'src/infrastructure/providers/voyage-embeddings.provider';
import { CustomMetadata } from 'src/types';

@Injectable()
export class LoadVectorStoreService {
  constructor(
    @Inject(VOYAGE_EMBEDDINGS) private embeddings: Embeddings,
    @Inject(SUPABASE_CLIENT) private supabaseClient: SupabaseClient,
  ) {}

  async execute(
    filter: CustomMetadata,
    tableName = 'documents',
  ): Promise<SupabaseVectorStore> {
    const vectorStore = await SupabaseVectorStore.fromExistingIndex(
      this.embeddings,
      {
        client: this.supabaseClient as unknown as any,
        tableName,
        queryName: `match_${tableName}`,
        filter,
      },
    );

    return vectorStore;
  }
}
