import { Module } from '@nestjs/common';

import { BuildSystemPromptModule } from 'src/modules/agent-runtime/build-system-prompt/build-system-prompt.module';
import { ResolveAgentService } from 'src/modules/agent-runtime/resolve-agent/resolve-agent.service';
import { AgentRepositoryModule } from 'src/modules/agents/repositories/agent.repository.module';
import { LoadAgentToolsModule } from 'src/modules/retrieval/load-agent-tools/load-agent-tools.module';

@Module({
  imports: [
    AgentRepositoryModule,
    BuildSystemPromptModule,
    LoadAgentToolsModule,
  ],
  providers: [ResolveAgentService],
  exports: [ResolveAgentService],
})
export class ResolveAgentModule {}
