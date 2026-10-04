import { Module } from '@nestjs/common';

import { ExecuteSimilaritySearchService } from 'src/modules/retrieval/execute-similarity-search/execute-similarity-search.service';
import { RerankDocumentsModule } from 'src/modules/retrieval/rerank-documents/rerank-documents.module';

@Module({
  imports: [RerankDocumentsModule],
  providers: [ExecuteSimilaritySearchService],
  exports: [ExecuteSimilaritySearchService],
})
export class ExecuteSimilaritySearchModule {}
