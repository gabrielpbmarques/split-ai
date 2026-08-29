import { Module } from '@nestjs/common';
import { VoyageEmbeddingsProviderModule } from 'src/infrastructure/providers/voyage-embeddings.provider.module';

import { ExecuteSimilaritySearchService } from './execute-similarity-search.service';

@Module({
  imports: [VoyageEmbeddingsProviderModule],
  providers: [ExecuteSimilaritySearchService],
  exports: [ExecuteSimilaritySearchService],
})
export class ExecuteSimilaritySearchModule {}
