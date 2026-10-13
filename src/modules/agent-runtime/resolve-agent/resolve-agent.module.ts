import { Module } from '@nestjs/common';

import { ResolveAgentService } from 'src/modules/agent-runtime/resolve-agent/resolve-agent.service';
import { ResolveMemorySourcesModule } from 'src/modules/agent-runtime/resolve-memory-sources/resolve-memory-sources.module';
import { ResolveSkillSourcesModule } from 'src/modules/agent-runtime/resolve-skill-sources/resolve-skill-sources.module';
import { ResolveSystemPromptModule } from 'src/modules/agent-runtime/resolve-system-prompt/resolve-system-prompt.module';
import { AgentRepositoryModule } from 'src/modules/agents/repositories/agent.repository.module';
import { LoadStoreModule } from 'src/modules/store/load-store/load-store.module';
import { ToolLoaderModule } from 'src/modules/tools/tool-loader/tool-loader.module';

@Module({
  imports: [
    AgentRepositoryModule,
    LoadStoreModule,
    ResolveMemorySourcesModule,
    ResolveSkillSourcesModule,
    ResolveSystemPromptModule,
    ToolLoaderModule,
  ],
  providers: [ResolveAgentService],
  exports: [ResolveAgentService],
})
export class ResolveAgentModule {}
