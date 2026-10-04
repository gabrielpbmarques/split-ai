import { Module } from '@nestjs/common';

import { AuthModule } from 'src/auth/auth.module';
import { CreateAgentConnectionController } from 'src/modules/agent-connections/create-agent-connection/create-agent-connection.controller';
import { CreateAgentConnectionService } from 'src/modules/agent-connections/create-agent-connection/create-agent-connection.service';
import { AgentConnectionRepositoryModule } from 'src/modules/agent-connections/repositories/agent-connection.repository.module';
import { AgentRepositoryModule } from 'src/modules/agents/repositories/agent.repository.module';

@Module({
  imports: [AuthModule, AgentConnectionRepositoryModule, AgentRepositoryModule],
  controllers: [CreateAgentConnectionController],
  providers: [CreateAgentConnectionService],
  exports: [CreateAgentConnectionService],
})
export class CreateAgentConnectionModule {}
