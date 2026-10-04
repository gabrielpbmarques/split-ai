import { ContextualCompressionRetriever } from '@langchain/classic/retrievers/contextual_compression';
import type { BaseRetrieverInterface } from '@langchain/core/retrievers';
import type { VectorStoreInterface } from '@langchain/core/vectorstores';
import { Injectable } from '@nestjs/common';
import type { Document } from 'langchain';

import { RerankDocumentsService } from 'src/modules/retrieval/rerank-documents/rerank-documents.service';
import { env } from 'src/shared/config/env';

@Injectable()
export class ExecuteSimilaritySearchService {
  constructor(
    private readonly rerankDocumentsService: RerankDocumentsService,
  ) {}

  async execute(
    vectorStore: VectorStoreInterface,
    question: string,
  ): Promise<Document[]> {
    const retriever = new ContextualCompressionRetriever({
      baseRetriever: vectorStore.asRetriever({
        k: env.VECTOR_SEARCH_CANDIDATE_K,
      }) as unknown as BaseRetrieverInterface,
      baseCompressor: this.rerankDocumentsService.execute(),
    });

    return retriever.invoke(question);
  }
}
