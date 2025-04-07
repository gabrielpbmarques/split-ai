import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { VertexAIEmbeddings } from '@langchain/google-vertexai';
import { Document } from '@langchain/core/documents';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExecuteSimilaritySearchService {
  constructor(private readonly embeddings: VertexAIEmbeddings) {}

  async execute(
    vectorStore: SupabaseVectorStore,
    question: string,
  ): Promise<Document<Record<string, any>>[]> {
    const topK = 30;
    const queryEmbeddings = await this.embeddings.embedQuery(question);
    const similarDocs = await vectorStore.similaritySearchVectorWithScore(
      queryEmbeddings,
      topK,
    );

    return similarDocs.flatMap((val) => val[0]);
  }
}
