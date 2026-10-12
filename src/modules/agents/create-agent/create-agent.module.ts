import { Module } from '@nestjs/common';

import { CreateAgentController } from 'src/modules/agents/create-agent/create-agent.controller';
import { CreateAgentService } from 'src/modules/agents/create-agent/create-agent.service';
import { AgentRepositoryModule } from 'src/modules/agents/repositories/agent.repository.module';

@Module({
  imports: [AgentRepositoryModule],
  controllers: [CreateAgentController],
  providers: [CreateAgentService],
  exports: [CreateAgentService],
})
export class CreateAgentModule {}
