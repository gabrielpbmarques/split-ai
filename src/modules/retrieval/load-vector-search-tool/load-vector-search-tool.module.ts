import { Module } from '@nestjs/common';

import { ExecuteSimilaritySearchModule } from 'src/modules/retrieval/execute-similarity-search/execute-similarity-search.module';
import { LoadVectorSearchToolService } from 'src/modules/retrieval/load-vector-search-tool/load-vector-search-tool.service';

@Module({
  imports: [ExecuteSimilaritySearchModule],
  providers: [LoadVectorSearchToolService],
  exports: [LoadVectorSearchToolService],
})
export class LoadVectorSearchToolModule {}
