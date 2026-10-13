import { Module } from '@nestjs/common';

import { BuildSystemPromptModule } from 'src/modules/agent-runtime/build-system-prompt/build-system-prompt.module';
import { ResolveAgentService } from 'src/modules/agent-runtime/resolve-agent/resolve-agent.service';
import { AgentRepositoryModule } from 'src/modules/agents/repositories/agent.repository.module';
import { LoadStoreModule } from 'src/modules/store/load-store/load-store.module';
import { ToolLoaderModule } from 'src/modules/tools/tool-loader/tool-loader.module';

@Module({
  imports: [
    AgentRepositoryModule,
    BuildSystemPromptModule,
    ToolLoaderModule,
    LoadStoreModule,
  ],
  providers: [ResolveAgentService],
  exports: [ResolveAgentService],
})
export class ResolveAgentModule {}
