import { Module } from '@nestjs/common';

import { RerankDocumentsModule } from '../RerankDocuments/rerank-documents.module';

import { ExecuteSimilaritySearchService } from './execute-similarity-search.service';

@Module({
  imports: [RerankDocumentsModule],
  providers: [ExecuteSimilaritySearchService],
  exports: [ExecuteSimilaritySearchService],
})
export class ExecuteSimilaritySearchModule {}
