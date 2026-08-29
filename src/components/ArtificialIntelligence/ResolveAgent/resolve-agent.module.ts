import { Module, forwardRef } from '@nestjs/common';
import { LoadAgentToolsModule } from 'src/components/Tools/LoadAgentTools/load-agent-tools.module';
import { AgentInstructionRepositoryModule } from 'src/repositories/agent-instruction.repository.module';
import { AgentRepositoryModule } from 'src/repositories/agent.repository.module';

import { BuildSystemPromptModule } from '../BuildSystemPrompt/build-system-prompt.module';
import { LoadCheckpointerModule } from '../LoadCheckpointer/load-checkpointer.module';

import { ResolveAgentService } from './resolve-agent.service';

@Module({
  imports: [
    AgentInstructionRepositoryModule,
    AgentRepositoryModule,
    BuildSystemPromptModule,
    forwardRef(() => LoadAgentToolsModule),
    LoadCheckpointerModule,
  ],
  providers: [ResolveAgentService],
  exports: [ResolveAgentService],
})
export class ResolveAgentModule {}
