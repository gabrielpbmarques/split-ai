import { Module } from '@nestjs/common';
import { ExecuteSimilaritySearchService } from './execute-similarity-search.service';

@Module({
  providers: [ExecuteSimilaritySearchService],
})
export class ExecuteSimilaritySearchModule {}
