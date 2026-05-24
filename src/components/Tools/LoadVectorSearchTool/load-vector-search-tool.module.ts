import { Module } from '@nestjs/common';

import { ExecuteSimilaritySearchModule } from '../ExecuteSimilaritySearch/execute-similarity-search.module';
import { LoadVectorStoreModule } from '../LoadVectorStore/load-vector-store.module';

import { LoadVectorSearchToolService } from './load-vector-search-tool.service';

@Module({
  imports: [ExecuteSimilaritySearchModule, LoadVectorStoreModule],
  providers: [LoadVectorSearchToolService],
  exports: [LoadVectorSearchToolService],
})
export class LoadVectorSearchToolModule {}
