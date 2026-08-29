import { Module } from '@nestjs/common';
import { AgentConnectionRepositoryModule } from 'src/repositories/agent-connection.repository.module';

import { DeleteAgentConnectionController } from './delete-agent-connection.controller';
import { DeleteAgentConnectionService } from './delete-agent-connection.service';

@Module({
  imports: [AgentConnectionRepositoryModule],
  controllers: [DeleteAgentConnectionController],
  providers: [DeleteAgentConnectionService],
  exports: [DeleteAgentConnectionService],
})
export class DeleteAgentConnectionModule {}
