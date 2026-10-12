import { Module } from '@nestjs/common';

import { ExecuteSimilaritySearchModule } from 'src/modules/retrieval/execute-similarity-search/execute-similarity-search.module';
import { LoadAgentToolsModule } from 'src/modules/retrieval/load-agent-tools/load-agent-tools.module';
import { LoadVectorSearchToolModule } from 'src/modules/retrieval/load-vector-search-tool/load-vector-search-tool.module';
import { RerankDocumentsModule } from 'src/modules/retrieval/rerank-documents/rerank-documents.module';

@Module({
  imports: [
    ExecuteSimilaritySearchModule,
    LoadAgentToolsModule,
    LoadVectorSearchToolModule,
    RerankDocumentsModule,
  ],
  exports: [
    ExecuteSimilaritySearchModule,
    LoadAgentToolsModule,
    LoadVectorSearchToolModule,
    RerankDocumentsModule,
  ],
})
export class RetrievalModule {}
