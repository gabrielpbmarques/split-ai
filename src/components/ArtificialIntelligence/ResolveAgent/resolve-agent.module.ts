import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { BuildSystemPromptModule } from '../BuildSystemPrompt/build-system-prompt.module';
import { LoadDatabaseToolModule } from '../LoadDatabaseTool/load-database-tool.module';
import { LoadVectorSearchToolModule } from '../LoadVectorSearchTool/load-vector-search-tool.module';

import { ResolveAgentService } from './resolve-agent.service';

@Module({
  imports: [
    RepositoriesModule,
    LoadDatabaseToolModule,
    LoadVectorSearchToolModule,
    BuildSystemPromptModule,
  ],
  providers: [ResolveAgentService],
  exports: [ResolveAgentService],
})
export class ResolveAgentModule {}
