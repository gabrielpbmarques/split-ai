import { Module } from '@nestjs/common';
import { ExecuteSimilaritySearchModule } from 'src/components/ArtificialIntelligence/ExecuteSimilaritySearch/execute-similarity-search.module';
import { LoadVectorStoreModule } from 'src/components/ArtificialIntelligence/LoadVectorStore/load-vector-store.module';

import { BusinessContextToolService } from './business-context-tool.service';

@Module({
  imports: [LoadVectorStoreModule, ExecuteSimilaritySearchModule],
  providers: [BusinessContextToolService],
  exports: [BusinessContextToolService],
})
export class BusinessContextToolModule {}
