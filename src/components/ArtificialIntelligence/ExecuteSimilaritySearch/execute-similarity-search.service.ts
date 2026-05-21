import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { Embeddings } from '@langchain/core/embeddings';
import { Injectable, Inject } from '@nestjs/common';
import { Document } from 'langchain';
import { VOYAGE_EMBEDDINGS } from 'src/infrastructure/providers/voyage-embeddings.provider';

@Injectable()
export class ExecuteSimilaritySearchService {
  constructor(
    @Inject(VOYAGE_EMBEDDINGS)
    private readonly embeddings: Embeddings,
  ) {}

  async execute(
    vectorStore: SupabaseVectorStore,
    question: string,
  ): Promise<Document<Record<string, any>>[]> {
    const topK = 10;
    const queryEmbeddings = await this.embeddings.embedQuery(question);
    const similarDocs = await vectorStore.similaritySearchVectorWithScore(
      queryEmbeddings,
      topK,
    );

    return similarDocs.flatMap((val) => val[0]);
  }
}
