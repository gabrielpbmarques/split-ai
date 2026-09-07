import { ContextualCompressionRetriever } from '@langchain/classic/retrievers/contextual_compression';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { BaseRetrieverInterface } from '@langchain/core/retrievers';
import { Injectable } from '@nestjs/common';
import { Document } from 'langchain';
import { config } from 'src/config';

import { RerankDocumentsService } from '../RerankDocuments/rerank-documents.service';

@Injectable()
export class ExecuteSimilaritySearchService {
  constructor(
    private readonly rerankDocumentsService: RerankDocumentsService,
  ) {}

  async execute(
    vectorStore: SupabaseVectorStore,
    question: string,
  ): Promise<Document<Record<string, any>>[]> {
    const retriever = new ContextualCompressionRetriever({
      baseRetriever: vectorStore.asRetriever({
        k: config.vectorSearchCandidateK,
      }) as unknown as BaseRetrieverInterface,
      baseCompressor: this.rerankDocumentsService.execute(),
    });

    return retriever.invoke(question);
  }
}
