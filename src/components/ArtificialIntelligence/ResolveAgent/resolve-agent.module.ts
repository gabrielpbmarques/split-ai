import { Module } from '@nestjs/common';
import { LoadDatabaseToolModule } from 'src/components/Tools/LoadDatabaseTool/load-database-tool.module';
import { LoadVectorSearchToolModule } from 'src/components/Tools/LoadVectorSearchTool/load-vector-search-tool.module';
import { ToolsModule } from 'src/components/Tools/tools.module';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { BuildSystemPromptModule } from '../BuildSystemPrompt/build-system-prompt.module';
import { LoadCheckpointerModule } from '../LoadCheckpointer/load-checkpointer.module';

import { ResolveAgentService } from './resolve-agent.service';

@Module({
  imports: [
    RepositoriesModule,
    LoadDatabaseToolModule,
    LoadVectorSearchToolModule,
    BuildSystemPromptModule,
    LoadCheckpointerModule,
    ToolsModule,
  ],
  providers: [ResolveAgentService],
  exports: [ResolveAgentService],
})
export class ResolveAgentModule {}
