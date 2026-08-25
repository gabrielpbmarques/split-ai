import { Module, forwardRef } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { InvokeConnectedAgentModule } from '../InvokeConnectionAgent/invoke-connected-agent.module';

import { AppendConnectionToolsService } from './append-connection-tools.service';

@Module({
  imports: [RepositoriesModule, forwardRef(() => InvokeConnectedAgentModule)],
  providers: [AppendConnectionToolsService],
  exports: [AppendConnectionToolsService],
})
export class AppendConnectionToolsModule {}
