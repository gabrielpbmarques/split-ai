import { Module } from '@nestjs/common';
import { AgentConnectionRepositoryModule } from 'src/repositories/agent-connection.repository.module';
import { AgentInstructionRepositoryModule } from 'src/repositories/agent-instruction.repository.module';
import { AgentRepositoryModule } from 'src/repositories/agent.repository.module';

import { UpdateAgentController } from './update-agent.controller';
import { UpdateAgentService } from './update-agent.service';

@Module({
  imports: [
    AgentConnectionRepositoryModule,
    AgentInstructionRepositoryModule,
    AgentRepositoryModule,
  ],
  controllers: [UpdateAgentController],
  providers: [UpdateAgentService],
  exports: [UpdateAgentService],
})
export class UpdateAgentModule {}
