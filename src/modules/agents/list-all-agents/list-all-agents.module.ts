import { Module } from '@nestjs/common';

import { ListAllAgentsController } from 'src/modules/agents/list-all-agents/list-all-agents.controller';
import { ListAllAgentsService } from 'src/modules/agents/list-all-agents/list-all-agents.service';
import { AgentInstructionRepositoryModule } from 'src/modules/agents/repositories/agent-instruction.repository.module';
import { AgentRepositoryModule } from 'src/modules/agents/repositories/agent.repository.module';

@Module({
  imports: [AgentInstructionRepositoryModule, AgentRepositoryModule],
  controllers: [ListAllAgentsController],
  providers: [ListAllAgentsService],
  exports: [ListAllAgentsService],
})
export class ListAllAgentsModule {}
