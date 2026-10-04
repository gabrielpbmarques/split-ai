import { Module } from '@nestjs/common';

import { ExecuteSimilaritySearchModule } from 'src/modules/retrieval/execute-similarity-search/execute-similarity-search.module';
import { LoadAgentToolsModule } from 'src/modules/retrieval/load-agent-tools/load-agent-tools.module';
import { LoadDatabaseToolModule } from 'src/modules/retrieval/load-database-tool/load-database-tool.module';
import { LoadVectorSearchToolModule } from 'src/modules/retrieval/load-vector-search-tool/load-vector-search-tool.module';
import { LoadVectorStoreModule } from 'src/modules/retrieval/load-vector-store/load-vector-store.module';
import { MaybeLoadDatabaseToolModule } from 'src/modules/retrieval/maybe-load-database-tool/maybe-load-database-tool.module';
import { RerankDocumentsModule } from 'src/modules/retrieval/rerank-documents/rerank-documents.module';

@Module({
  imports: [
    ExecuteSimilaritySearchModule,
    LoadAgentToolsModule,
    LoadDatabaseToolModule,
    LoadVectorSearchToolModule,
    LoadVectorStoreModule,
    MaybeLoadDatabaseToolModule,
    RerankDocumentsModule,
  ],
  exports: [
    ExecuteSimilaritySearchModule,
    LoadAgentToolsModule,
    LoadDatabaseToolModule,
    LoadVectorSearchToolModule,
    LoadVectorStoreModule,
    MaybeLoadDatabaseToolModule,
    RerankDocumentsModule,
  ],
})
export class RetrievalModule {}
