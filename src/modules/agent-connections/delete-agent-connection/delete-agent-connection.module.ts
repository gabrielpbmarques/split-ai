import { Module } from '@nestjs/common';

import { DeleteAgentConnectionController } from 'src/modules/agent-connections/delete-agent-connection/delete-agent-connection.controller';
import { DeleteAgentConnectionService } from 'src/modules/agent-connections/delete-agent-connection/delete-agent-connection.service';
import { AgentConnectionRepositoryModule } from 'src/modules/agent-connections/repositories/agent-connection.repository.module';

@Module({
  imports: [AgentConnectionRepositoryModule],
  controllers: [DeleteAgentConnectionController],
  providers: [DeleteAgentConnectionService],
  exports: [DeleteAgentConnectionService],
})
export class DeleteAgentConnectionModule {}
