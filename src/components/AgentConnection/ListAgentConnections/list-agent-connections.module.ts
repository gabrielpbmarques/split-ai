import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { AgentConnectionRepositoryModule } from 'src/repositories/agent-connection.repository.module';
import { AgentRepositoryModule } from 'src/repositories/agent.repository.module';

import { ListAgentConnectionsController } from './list-agent-connections.controller';
import { ListAgentConnectionsService } from './list-agent-connections.service';

@Module({
  imports: [AuthModule, AgentConnectionRepositoryModule, AgentRepositoryModule],
  controllers: [ListAgentConnectionsController],
  providers: [ListAgentConnectionsService],
  exports: [ListAgentConnectionsService],
})
export class ListAgentConnectionsModule {}
