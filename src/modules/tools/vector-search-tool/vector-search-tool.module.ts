import { Module } from '@nestjs/common';

import { ExecuteSimilaritySearchModule } from 'src/modules/retrieval/execute-similarity-search/execute-similarity-search.module';
import { VectorSearchToolService } from 'src/modules/tools/vector-search-tool/vector-search-tool.service';

@Module({
  imports: [ExecuteSimilaritySearchModule],
  providers: [VectorSearchToolService],
  exports: [VectorSearchToolService],
})
export class VectorSearchToolModule {}
