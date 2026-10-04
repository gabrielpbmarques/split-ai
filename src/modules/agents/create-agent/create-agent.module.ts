import { Module } from '@nestjs/common';

import { TransactionExecutorModule } from 'src/infrastructure/database/transaction-executor/transaction-executor.module';
import { CreateAgentController } from 'src/modules/agents/create-agent/create-agent.controller';
import { CreateAgentService } from 'src/modules/agents/create-agent/create-agent.service';
import { AgentInstructionRepositoryModule } from 'src/modules/agents/repositories/agent-instruction.repository.module';
import { AgentRepositoryModule } from 'src/modules/agents/repositories/agent.repository.module';
import { OrganizationRepositoryModule } from 'src/modules/organizations/repositories/organization.repository.module';

@Module({
  imports: [
    TransactionExecutorModule,
    AgentInstructionRepositoryModule,
    AgentRepositoryModule,
    OrganizationRepositoryModule,
  ],
  controllers: [CreateAgentController],
  providers: [CreateAgentService],
  exports: [CreateAgentService],
})
export class CreateAgentModule {}
