import { Module } from '@nestjs/common';

import { AgentConnectionRepositoryModule } from 'src/modules/agent-connections/repositories/agent-connection.repository.module';
import { AppendConnectionToolsService } from 'src/modules/agent-runtime/append-connection-tools/append-connection-tools.service';
import { InvokeConnectedAgentModule } from 'src/modules/agent-runtime/invoke-connection-agent/invoke-connected-agent.module';

@Module({
  imports: [AgentConnectionRepositoryModule, InvokeConnectedAgentModule],
  providers: [AppendConnectionToolsService],
  exports: [AppendConnectionToolsService],
})
export class AppendConnectionToolsModule {}
