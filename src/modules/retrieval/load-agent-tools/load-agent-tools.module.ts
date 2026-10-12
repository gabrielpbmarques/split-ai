import { Module } from '@nestjs/common';

import { AppendConnectionToolsModule } from 'src/modules/agent-runtime/append-connection-tools/append-connection-tools.module';
import { LoadAgentToolsService } from 'src/modules/retrieval/load-agent-tools/load-agent-tools.service';
import { LoadVectorSearchToolModule } from 'src/modules/retrieval/load-vector-search-tool/load-vector-search-tool.module';
@Module({
  imports: [AppendConnectionToolsModule, LoadVectorSearchToolModule],
  providers: [LoadAgentToolsService],
  exports: [LoadAgentToolsService],
})
export class LoadAgentToolsModule {}
