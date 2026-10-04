import { Module } from '@nestjs/common';

import { AuthModule } from 'src/auth/auth.module';
import { AgentConnectionRepositoryModule } from 'src/modules/agent-connections/repositories/agent-connection.repository.module';
import { AgentInstructionRepositoryModule } from 'src/modules/agents/repositories/agent-instruction.repository.module';
import { AgentRepositoryModule } from 'src/modules/agents/repositories/agent.repository.module';
import { UpdateAgentController } from 'src/modules/agents/update-agent/update-agent.controller';
import { UpdateAgentService } from 'src/modules/agents/update-agent/update-agent.service';

@Module({
  imports: [
    AuthModule,
    AgentConnectionRepositoryModule,
    AgentInstructionRepositoryModule,
    AgentRepositoryModule,
  ],
  controllers: [UpdateAgentController],
  providers: [UpdateAgentService],
  exports: [UpdateAgentService],
})
export class UpdateAgentModule {}
