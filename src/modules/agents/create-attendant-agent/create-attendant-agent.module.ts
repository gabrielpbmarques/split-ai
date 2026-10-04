import { Module } from '@nestjs/common';

import { CreateAttendantAgentController } from 'src/modules/agents/create-attendant-agent/create-attendant-agent.controller';
import { CreateAttendantAgentService } from 'src/modules/agents/create-attendant-agent/create-attendant-agent.service';
import { AgentInstructionRepositoryModule } from 'src/modules/agents/repositories/agent-instruction.repository.module';
import { AgentRepositoryModule } from 'src/modules/agents/repositories/agent.repository.module';

@Module({
  imports: [AgentInstructionRepositoryModule, AgentRepositoryModule],
  providers: [CreateAttendantAgentService],
  controllers: [CreateAttendantAgentController],
  exports: [CreateAttendantAgentService],
})
export class CreateAttendantAgentModule {}
