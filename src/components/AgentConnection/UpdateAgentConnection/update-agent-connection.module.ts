import { Module } from '@nestjs/common';
import { AgentConnectionRepositoryModule } from 'src/repositories/agent-connection.repository.module';

import { UpdateAgentConnectionController } from './update-agent-connection.controller';
import { UpdateAgentConnectionService } from './update-agent-connection.service';

@Module({
  imports: [AgentConnectionRepositoryModule],
  controllers: [UpdateAgentConnectionController],
  providers: [UpdateAgentConnectionService],
  exports: [UpdateAgentConnectionService],
})
export class UpdateAgentConnectionModule {}
