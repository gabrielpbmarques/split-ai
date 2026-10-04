import { Module } from '@nestjs/common';

import { AppendConnectionToolsModule } from 'src/modules/agent-runtime/append-connection-tools/append-connection-tools.module';
import { BuildSystemPromptModule } from 'src/modules/agent-runtime/build-system-prompt/build-system-prompt.module';
import { GenerateAiResponseModule } from 'src/modules/agent-runtime/generate-ai-response/generate-ai-response.module';
import { InvokeConnectedAgentModule } from 'src/modules/agent-runtime/invoke-connection-agent/invoke-connected-agent.module';
import { LoadCheckpointerModule } from 'src/modules/agent-runtime/load-checkpointer/load-checkpointer.module';
import { NormalizePromptInstructionsModule } from 'src/modules/agent-runtime/normalize-prompt-instructions/normalize-prompt-instructions.module';
import { ResolveAgentModule } from 'src/modules/agent-runtime/resolve-agent/resolve-agent.module';

@Module({
  imports: [
    AppendConnectionToolsModule,
    BuildSystemPromptModule,
    GenerateAiResponseModule,
    InvokeConnectedAgentModule,
    LoadCheckpointerModule,
    NormalizePromptInstructionsModule,
    ResolveAgentModule,
  ],
  exports: [
    AppendConnectionToolsModule,
    BuildSystemPromptModule,
    GenerateAiResponseModule,
    InvokeConnectedAgentModule,
    LoadCheckpointerModule,
    NormalizePromptInstructionsModule,
    ResolveAgentModule,
  ],
})
export class AgentRuntimeModule {}
