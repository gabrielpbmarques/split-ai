import { Module, forwardRef } from '@nestjs/common';
import { LoadAgentToolsModule } from 'src/components/Tools/LoadAgentTools/load-agent-tools.module';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { BuildSystemPromptModule } from '../BuildSystemPrompt/build-system-prompt.module';
import { LoadCheckpointerModule } from '../LoadCheckpointer/load-checkpointer.module';

import { ResolveAgentService } from './resolve-agent.service';

@Module({
  imports: [
    RepositoriesModule,
    BuildSystemPromptModule,
    LoadCheckpointerModule,
    forwardRef(() => LoadAgentToolsModule),
  ],
  providers: [ResolveAgentService],
  exports: [ResolveAgentService],
})
export class ResolveAgentModule {}
