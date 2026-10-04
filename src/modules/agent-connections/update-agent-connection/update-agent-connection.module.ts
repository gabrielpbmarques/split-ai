import { Module } from '@nestjs/common';

import { AgentConnectionRepositoryModule } from 'src/modules/agent-connections/repositories/agent-connection.repository.module';
import { UpdateAgentConnectionController } from 'src/modules/agent-connections/update-agent-connection/update-agent-connection.controller';
import { UpdateAgentConnectionService } from 'src/modules/agent-connections/update-agent-connection/update-agent-connection.service';

@Module({
  imports: [AgentConnectionRepositoryModule],
  controllers: [UpdateAgentConnectionController],
  providers: [UpdateAgentConnectionService],
  exports: [UpdateAgentConnectionService],
})
export class UpdateAgentConnectionModule {}
