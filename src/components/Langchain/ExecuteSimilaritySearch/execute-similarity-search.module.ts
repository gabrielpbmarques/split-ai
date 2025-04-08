import { Module } from '@nestjs/common';
import { ExecuteSimilaritySearchService } from './execute-similarity-search.service';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';

@Module({
  imports: [InfrastructureModule],
  providers: [ExecuteSimilaritySearchService],
  exports: [ExecuteSimilaritySearchService],
})
export class ExecuteSimilaritySearchModule {}
