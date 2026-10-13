import { Module } from '@nestjs/common';

import { ExecuteSimilaritySearchModule } from 'src/modules/retrieval/execute-similarity-search/execute-similarity-search.module';
import { RerankDocumentsModule } from 'src/modules/retrieval/rerank-documents/rerank-documents.module';

@Module({
  imports: [ExecuteSimilaritySearchModule, RerankDocumentsModule],
  exports: [ExecuteSimilaritySearchModule, RerankDocumentsModule],
})
export class RetrievalModule {}
