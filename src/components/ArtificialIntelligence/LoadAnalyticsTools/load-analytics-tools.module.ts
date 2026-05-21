import { Module } from '@nestjs/common';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';

import { ExecuteSimilaritySearchModule } from '../ExecuteSimilaritySearch/execute-similarity-search.module';
import { LoadVectorStoreModule } from '../LoadVectorStore/load-vector-store.module';

import { LoadAnalyticsToolsService } from './load-analytics-tools.service';
import { QueryResultCacheService } from './query-result-cache.service';

@Module({
  imports: [
    InfrastructureModule,
    LoadVectorStoreModule,
    ExecuteSimilaritySearchModule,
  ],
  providers: [LoadAnalyticsToolsService, QueryResultCacheService],
  exports: [LoadAnalyticsToolsService, QueryResultCacheService],
})
export class LoadAnalyticsToolsModule {}
