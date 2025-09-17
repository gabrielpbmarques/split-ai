import { Module } from '@nestjs/common';

import { BuildSystemPromptModule } from './BuildSystemPrompt/build-system-prompt.module';
import { ConvertTextToSpeechModule } from './ConvertTextToSpeech/convert-text-to-speech.module';
import { CreateHistoryModule } from './CreateHistory/create-history.module';
import { ExecuteSimilaritySearchModule } from './ExecuteSimilaritySearch/execute-similarity-search.module';
import { FillPromptModule } from './FillPrompt/fill-prompt.module';
import { GenerateAgentSourceModule } from './GenerateAgentSource/generate-agent-source.module';
import { GenerateAiResponseModule } from './GenerateAIResponse/generate-ai-response.module';
import { GetRunnableChatModule } from './GetRunnableChat/get-runnable-chat.module';
import { LoadAiChatModule } from './LoadAiChat/load-ai-chat.module';
import { LoadVectorStoreModule } from './LoadVectorStore/load-vector-store.module';
import { NormalizePromptInstructionsModule } from './NormalizePromptInstructions/normalize-prompt-instructions.module';
import { CreateAgentModule } from './CreateAgent/create-agent.module';
import { ResolveAgentModule } from './ResolveAgent/resolve-agent.module';
import { UpdateAgentModule } from './UpdateAgent/update-agent.module';

@Module({
  imports: [
    ConvertTextToSpeechModule,
    CreateHistoryModule,
    ExecuteSimilaritySearchModule,
    GetRunnableChatModule,
    LoadAiChatModule,
    LoadVectorStoreModule,
    GenerateAgentSourceModule,
    BuildSystemPromptModule,
    FillPromptModule,
    NormalizePromptInstructionsModule,
    GenerateAiResponseModule,
    CreateAgentModule,
    ResolveAgentModule,
    UpdateAgentModule,
  ],
  exports: [
    ConvertTextToSpeechModule,
    CreateHistoryModule,
    ExecuteSimilaritySearchModule,
    GetRunnableChatModule,
    LoadAiChatModule,
    LoadVectorStoreModule,
    GenerateAgentSourceModule,
    BuildSystemPromptModule,
    FillPromptModule,
    NormalizePromptInstructionsModule,
    GenerateAiResponseModule,
    CreateAgentModule,
    ResolveAgentModule,
    UpdateAgentModule,
  ],
})
export class ArtificialIntelligenceModule {}
