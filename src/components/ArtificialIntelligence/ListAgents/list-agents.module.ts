import { Module } from '@nestjs/common';
import { AgentConnectionRepositoryModule } from 'src/repositories/agent-connection.repository.module';
import { AgentRepositoryModule } from 'src/repositories/agent.repository.module';

import { ListAgentsController } from './list-agents.controller';
import { ListAgentsService } from './list-agents.service';

@Module({
  imports: [AgentConnectionRepositoryModule, AgentRepositoryModule],
  controllers: [ListAgentsController],
  providers: [ListAgentsService],
  exports: [ListAgentsService],
})
export class ListAgentsModule {}
