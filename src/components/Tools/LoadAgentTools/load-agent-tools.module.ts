import { Module, forwardRef } from '@nestjs/common';
import { AppendConnectionToolsModule } from 'src/components/ArtificialIntelligence/AppendConnectionTools/append-connection-tools.module';

import { LoadVectorSearchToolModule } from '../LoadVectorSearchTool/load-vector-search-tool.module';
import { MaybeLoadDatabaseToolModule } from '../MaybeLoadDatabaseTool/maybe-load-database-tool.module';

import { LoadAgentToolsService } from './load-agent-tools.service';

@Module({
  imports: [
    forwardRef(() => AppendConnectionToolsModule),
    LoadVectorSearchToolModule,
    MaybeLoadDatabaseToolModule,
  ],
  providers: [LoadAgentToolsService],
  exports: [LoadAgentToolsService],
})
export class LoadAgentToolsModule {}
