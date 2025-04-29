import { Module } from '@nestjs/common';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { ExecuteSimilaritySearchService } from 'src/components/Langchain/ExecuteSimilaritySearch/execute-similarity-search.service';

@Module({
  imports: [InfrastructureModule],
  providers: [ExecuteSimilaritySearchService],
  exports: [ExecuteSimilaritySearchService],
})
export class ExecuteSimilaritySearchModule {}
