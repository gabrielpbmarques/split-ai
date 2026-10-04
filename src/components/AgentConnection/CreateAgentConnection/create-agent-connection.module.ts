import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { AgentConnectionRepositoryModule } from 'src/repositories/agent-connection.repository.module';
import { AgentRepositoryModule } from 'src/repositories/agent.repository.module';

import { CreateAgentConnectionController } from './create-agent-connection.controller';
import { CreateAgentConnectionService } from './create-agent-connection.service';

@Module({
  imports: [AuthModule, AgentConnectionRepositoryModule, AgentRepositoryModule],
  controllers: [CreateAgentConnectionController],
  providers: [CreateAgentConnectionService],
  exports: [CreateAgentConnectionService],
})
export class CreateAgentConnectionModule {}
