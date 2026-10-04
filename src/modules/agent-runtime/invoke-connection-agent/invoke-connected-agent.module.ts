import { Module } from '@nestjs/common';

import { InvokeConnectedAgentService } from 'src/modules/agent-runtime/invoke-connection-agent/invoke-connected-agent.service';

@Module({
  providers: [InvokeConnectedAgentService],
  exports: [InvokeConnectedAgentService],
})
export class InvokeConnectedAgentModule {}
