import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { VertexAIEmbeddings } from '@langchain/google-vertexai';
import { Injectable, Inject } from '@nestjs/common';
import { Document } from 'langchain';
import { VERTEX_AI_EMBEDDINGS } from 'src/infrastructure/providers/vertex-ai.provider';

@Injectable()
export class ExecuteSimilaritySearchService {
  constructor(
    @Inject(VERTEX_AI_EMBEDDINGS)
    private readonly embeddings: VertexAIEmbeddings,
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
