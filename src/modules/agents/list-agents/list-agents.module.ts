import { Module } from '@nestjs/common';

import { AgentConnectionRepositoryModule } from 'src/modules/agent-connections/repositories/agent-connection.repository.module';
import { ListAgentsController } from 'src/modules/agents/list-agents/list-agents.controller';
import { ListAgentsService } from 'src/modules/agents/list-agents/list-agents.service';
import { AgentRepositoryModule } from 'src/modules/agents/repositories/agent.repository.module';

@Module({
  imports: [AgentConnectionRepositoryModule, AgentRepositoryModule],
  controllers: [ListAgentsController],
  providers: [ListAgentsService],
  exports: [ListAgentsService],
})
export class ListAgentsModule {}
