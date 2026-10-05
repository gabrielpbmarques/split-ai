import { Module } from '@nestjs/common';

import { AgentConnectionRepositoryModule } from 'src/modules/agent-connections/repositories/agent-connection.repository.module';
import { GetAgentController } from 'src/modules/agents/get-agent/get-agent.controller';
import { GetAgentService } from 'src/modules/agents/get-agent/get-agent.service';
import { AgentInstructionRepositoryModule } from 'src/modules/agents/repositories/agent-instruction.repository.module';
import { AgentRepositoryModule } from 'src/modules/agents/repositories/agent.repository.module';

@Module({
  imports: [
    AgentConnectionRepositoryModule,
    AgentInstructionRepositoryModule,
    AgentRepositoryModule,
  ],
  controllers: [GetAgentController],
  providers: [GetAgentService],
  exports: [GetAgentService],
})
export class GetAgentModule {}
