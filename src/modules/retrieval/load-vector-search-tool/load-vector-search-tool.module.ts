import { Module } from '@nestjs/common';

import { ExecuteSimilaritySearchModule } from 'src/modules/retrieval/execute-similarity-search/execute-similarity-search.module';
import { LoadVectorSearchToolService } from 'src/modules/retrieval/load-vector-search-tool/load-vector-search-tool.service';
import { LoadVectorStoreModule } from 'src/modules/retrieval/load-vector-store/load-vector-store.module';

@Module({
  imports: [ExecuteSimilaritySearchModule, LoadVectorStoreModule],
  providers: [LoadVectorSearchToolService],
  exports: [LoadVectorSearchToolService],
})
export class LoadVectorSearchToolModule {}
