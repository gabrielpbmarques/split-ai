import { Module, forwardRef } from '@nestjs/common';
import { AgentConnectionRepositoryModule } from 'src/repositories/agent-connection.repository.module';

import { InvokeConnectedAgentModule } from '../InvokeConnectionAgent/invoke-connected-agent.module';

import { AppendConnectionToolsService } from './append-connection-tools.service';

@Module({
  imports: [
    AgentConnectionRepositoryModule,
    forwardRef(() => InvokeConnectedAgentModule),
  ],
  providers: [AppendConnectionToolsService],
  exports: [AppendConnectionToolsService],
})
export class AppendConnectionToolsModule {}
