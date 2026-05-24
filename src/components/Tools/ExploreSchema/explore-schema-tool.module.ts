import { Module } from '@nestjs/common';
import { ExecuteSimilaritySearchModule } from 'src/components/ArtificialIntelligence/ExecuteSimilaritySearch/execute-similarity-search.module';
import { LoadVectorStoreModule } from 'src/components/ArtificialIntelligence/LoadVectorStore/load-vector-store.module';

import { ExploreSchemaToolService } from './explore-schema-tool.service';

@Module({
  imports: [LoadVectorStoreModule, ExecuteSimilaritySearchModule],
  providers: [ExploreSchemaToolService],
  exports: [ExploreSchemaToolService],
})
export class ExploreSchemaToolModule {}
