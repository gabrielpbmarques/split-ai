import { BaseDocumentCompressor } from '@langchain/classic/retrievers/document_compressors';
import { Document, type DocumentInterface } from '@langchain/core/documents';
import { Inject, Injectable, Logger } from '@nestjs/common';

import {
  RERANKER,
  type RerankerGateway,
} from 'src/infrastructure/integration/reranker.port';
import { env } from 'src/shared/config/env';

export class VoyageRerankCompressor extends BaseDocumentCompressor {
  private readonly logger = new Logger(VoyageRerankCompressor.name);

  constructor(
    private readonly rerankService: RerankerGateway,
    private readonly minScore: number,
    private readonly maxResults: number,
  ) {
    super();
  }

  async compressDocuments(
    documents: DocumentInterface[],
    query: string,
  ): Promise<DocumentInterface[]> {
    if (!documents.length) {
      return [];
    }

    const results = await this.rerankService.rerank(
      query,
      documents.map((document) => document.pageContent),
    );

    const relevant = results
      .filter((result) => result.relevanceScore >= this.minScore)
      .slice(0, this.maxResults);

    if (!relevant.length) {
      this.logger.warn(
        `No document scored >= ${this.minScore} among ${documents.length} candidates ` +
          `(best score: ${results[0]?.relevanceScore ?? 'n/a'}). ` +
          'Lower VECTOR_SEARCH_MIN_SCORE if this repeats.',
      );

      return [];
    }

    return relevant.map(({ index, relevanceScore }) => {
      const document = documents[index];

      return new Document({
        pageContent: document.pageContent,
        metadata: { ...document.metadata, relevance_score: relevanceScore },
      });
    });
  }
}

@Injectable()
export class RerankDocumentsService {
  constructor(
    @Inject(RERANKER) private readonly rerankService: RerankerGateway,
  ) {}

  execute(): BaseDocumentCompressor {
    return new VoyageRerankCompressor(
      this.rerankService,
      env.VECTOR_SEARCH_MIN_SCORE,
      env.VECTOR_SEARCH_MAX_RESULTS,
    );
  }
}
