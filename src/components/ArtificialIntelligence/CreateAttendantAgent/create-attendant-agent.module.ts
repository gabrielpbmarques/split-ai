import { Module } from '@nestjs/common';
import { AgentInstructionRepositoryModule } from 'src/repositories/agent-instruction.repository.module';
import { AgentRepositoryModule } from 'src/repositories/agent.repository.module';

import { CreateAttendantAgentController } from './create-attendant-agent.controller';
import { CreateAttendantAgentService } from './create-attendant-agent.service';

@Module({
  imports: [AgentInstructionRepositoryModule, AgentRepositoryModule],
  providers: [CreateAttendantAgentService],
  controllers: [CreateAttendantAgentController],
  exports: [CreateAttendantAgentService],
})
export class CreateAttendantAgentModule {}
