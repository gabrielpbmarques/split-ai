import { Module } from '@nestjs/common';
import { ExecuteSimilaritySearchModule } from 'src/components/ArtificialIntelligence/ExecuteSimilaritySearch/execute-similarity-search.module';
import { LoadVectorStoreModule } from 'src/components/ArtificialIntelligence/LoadVectorStore/load-vector-store.module';

import { LoadVectorSearchToolService } from './load-vector-search-tool.service';

@Module({
  imports: [ExecuteSimilaritySearchModule, LoadVectorStoreModule],
  providers: [LoadVectorSearchToolService],
  exports: [LoadVectorSearchToolService],
})
export class LoadVectorSearchToolModule {}
