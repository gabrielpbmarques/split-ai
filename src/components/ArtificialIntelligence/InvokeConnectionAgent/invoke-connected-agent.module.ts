import { Module, forwardRef } from '@nestjs/common';

import { ResolveAgentModule } from '../ResolveAgent/resolve-agent.module';

import { InvokeConnectedAgentService } from './invoke-connected-agent.service';

@Module({
  imports: [forwardRef(() => ResolveAgentModule)],
  providers: [InvokeConnectedAgentService],
  exports: [InvokeConnectedAgentService],
})
export class InvokeConnectedAgentModule {}
