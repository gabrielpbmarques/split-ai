import { Module } from '@nestjs/common';

import { AgentRepositoryModule } from 'src/modules/agents/repositories/agent.repository.module';
import { UpdateAgentController } from 'src/modules/agents/update-agent/update-agent.controller';
import { UpdateAgentService } from 'src/modules/agents/update-agent/update-agent.service';

@Module({
  imports: [AgentRepositoryModule],
  controllers: [UpdateAgentController],
  providers: [UpdateAgentService],
  exports: [UpdateAgentService],
})
export class UpdateAgentModule {}
