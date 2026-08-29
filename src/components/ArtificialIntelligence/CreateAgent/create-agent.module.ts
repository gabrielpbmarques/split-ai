import { Module } from '@nestjs/common';
import { AgentInstructionRepositoryModule } from 'src/repositories/agent-instruction.repository.module';
import { AgentRepositoryModule } from 'src/repositories/agent.repository.module';
import { OrganizationRepositoryModule } from 'src/repositories/organization.repository.module';

import { CreateAgentController } from './create-agent.controller';
import { CreateAgentService } from './create-agent.service';

@Module({
  imports: [
    AgentInstructionRepositoryModule,
    AgentRepositoryModule,
    OrganizationRepositoryModule,
  ],
  controllers: [CreateAgentController],
  providers: [CreateAgentService],
  exports: [CreateAgentService],
})
export class CreateAgentModule {}
