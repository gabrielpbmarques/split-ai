import { Module } from '@nestjs/common';

import { CreateAgentConnectionController } from 'src/modules/agent-connections/create-agent-connection/create-agent-connection.controller';
import { CreateAgentConnectionService } from 'src/modules/agent-connections/create-agent-connection/create-agent-connection.service';
import { AgentConnectionRepositoryModule } from 'src/modules/agent-connections/repositories/agent-connection.repository.module';
import { AgentRepositoryModule } from 'src/modules/agents/repositories/agent.repository.module';

@Module({
  imports: [AgentConnectionRepositoryModule, AgentRepositoryModule],
  controllers: [CreateAgentConnectionController],
  providers: [CreateAgentConnectionService],
  exports: [CreateAgentConnectionService],
})
export class CreateAgentConnectionModule {}
