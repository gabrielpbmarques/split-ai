import { Module } from '@nestjs/common';

import { BuildSystemPromptModule } from 'src/modules/agent-runtime/build-system-prompt/build-system-prompt.module';
import { GenerateAiResponseModule } from 'src/modules/agent-runtime/generate-ai-response/generate-ai-response.module';
import { ResolveAgentModule } from 'src/modules/agent-runtime/resolve-agent/resolve-agent.module';
import { ResolveMemorySourcesModule } from 'src/modules/agent-runtime/resolve-memory-sources/resolve-memory-sources.module';
import { ResolveSkillSourcesModule } from 'src/modules/agent-runtime/resolve-skill-sources/resolve-skill-sources.module';
import { ResolveSystemPromptModule } from 'src/modules/agent-runtime/resolve-system-prompt/resolve-system-prompt.module';

@Module({
  imports: [
    BuildSystemPromptModule,
    GenerateAiResponseModule,
    ResolveAgentModule,
    ResolveMemorySourcesModule,
    ResolveSkillSourcesModule,
    ResolveSystemPromptModule,
  ],
  exports: [
    BuildSystemPromptModule,
    GenerateAiResponseModule,
    ResolveAgentModule,
    ResolveMemorySourcesModule,
    ResolveSkillSourcesModule,
    ResolveSystemPromptModule,
  ],
})
export class AgentRuntimeModule {}
