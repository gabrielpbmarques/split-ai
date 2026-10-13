import { Module } from '@nestjs/common';

import { BuildSystemPromptModule } from 'src/modules/agent-runtime/build-system-prompt/build-system-prompt.module';
import { GenerateAiResponseModule } from 'src/modules/agent-runtime/generate-ai-response/generate-ai-response.module';
import { ResolveAgentModule } from 'src/modules/agent-runtime/resolve-agent/resolve-agent.module';

@Module({
  imports: [
    BuildSystemPromptModule,
    GenerateAiResponseModule,
    ResolveAgentModule,
  ],
  exports: [
    BuildSystemPromptModule,
    GenerateAiResponseModule,
    ResolveAgentModule,
  ],
})
export class AgentRuntimeModule {}
