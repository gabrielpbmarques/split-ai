import { Module } from '@nestjs/common';
import { AgentConnectionRepositoryModule } from 'src/repositories/agent-connection.repository.module';
import { AgentRepositoryModule } from 'src/repositories/agent.repository.module';

import { ListAgentConnectionsController } from './list-agent-connections.controller';
import { ListAgentConnectionsService } from './list-agent-connections.service';

@Module({
  imports: [AgentConnectionRepositoryModule, AgentRepositoryModule],
  controllers: [ListAgentConnectionsController],
  providers: [ListAgentConnectionsService],
  exports: [ListAgentConnectionsService],
})
export class ListAgentConnectionsModule {}
