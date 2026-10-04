import { Module } from '@nestjs/common';

import { BuildSystemPromptModule } from 'src/modules/agent-runtime/build-system-prompt/build-system-prompt.module';
import { LoadCheckpointerModule } from 'src/modules/agent-runtime/load-checkpointer/load-checkpointer.module';
import { ResolveAgentService } from 'src/modules/agent-runtime/resolve-agent/resolve-agent.service';
import { AgentInstructionRepositoryModule } from 'src/modules/agents/repositories/agent-instruction.repository.module';
import { AgentRepositoryModule } from 'src/modules/agents/repositories/agent.repository.module';
import { LoadAgentToolsModule } from 'src/modules/retrieval/load-agent-tools/load-agent-tools.module';

@Module({
  imports: [
    AgentInstructionRepositoryModule,
    AgentRepositoryModule,
    BuildSystemPromptModule,
    LoadAgentToolsModule,
    LoadCheckpointerModule,
  ],
  providers: [ResolveAgentService],
  exports: [ResolveAgentService],
})
export class ResolveAgentModule {}
