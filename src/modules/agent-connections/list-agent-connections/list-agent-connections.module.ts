import { Module } from '@nestjs/common';

import { ListAgentConnectionsController } from 'src/modules/agent-connections/list-agent-connections/list-agent-connections.controller';
import { ListAgentConnectionsService } from 'src/modules/agent-connections/list-agent-connections/list-agent-connections.service';
import { AgentConnectionRepositoryModule } from 'src/modules/agent-connections/repositories/agent-connection.repository.module';
import { AgentRepositoryModule } from 'src/modules/agents/repositories/agent.repository.module';

@Module({
  imports: [AgentConnectionRepositoryModule, AgentRepositoryModule],
  controllers: [ListAgentConnectionsController],
  providers: [ListAgentConnectionsService],
  exports: [ListAgentConnectionsService],
})
export class ListAgentConnectionsModule {}
