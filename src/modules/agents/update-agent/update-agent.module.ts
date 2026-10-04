import { Module } from '@nestjs/common';

import { AuthModule } from 'src/auth/auth.module';
import { AgentInstructionRepositoryModule } from 'src/modules/agents/repositories/agent-instruction.repository.module';
import { AgentRepositoryModule } from 'src/modules/agents/repositories/agent.repository.module';
import { UpdateAgentController } from 'src/modules/agents/update-agent/update-agent.controller';
import { UpdateAgentService } from 'src/modules/agents/update-agent/update-agent.service';

@Module({
  imports: [
    AuthModule,
    AgentInstructionRepositoryModule,
    AgentRepositoryModule,
  ],
  controllers: [UpdateAgentController],
  providers: [UpdateAgentService],
  exports: [UpdateAgentService],
})
export class UpdateAgentModule {}
