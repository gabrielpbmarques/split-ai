import { Module } from '@nestjs/common';

import { BuildSystemPromptModule } from './BuildSystemPrompt/build-system-prompt.module';
import { ConvertTextToSpeechModule } from './ConvertTextToSpeech/convert-text-to-speech.module';
import { CreateAgentModule } from './CreateAgent/create-agent.module';
import { CreateAttendantAgentModule } from './CreateAttendantAgent/create-attendant-agent.module';
import { ExecuteSimilaritySearchModule } from './ExecuteSimilaritySearch/execute-similarity-search.module';
import { GenerateAgentSourceModule } from './GenerateAgentSource/generate-agent-source.module';
import { GenerateAiResponseModule } from './GenerateAIResponse/generate-ai-response.module';
import { ListAgentsModule } from './ListAgents/list-agents.module';
import { LoadAgentSitesModule } from './LoadAgentSites/load-agent-sites.module';
import { LoadAiChatModule } from './LoadAiChat/load-ai-chat.module';
import { LoadVectorSearchToolModule } from './LoadVectorSearchTool/load-vector-search-tool.module';
import { LoadVectorStoreModule } from './LoadVectorStore/load-vector-store.module';
import { NormalizePromptInstructionsModule } from './NormalizePromptInstructions/normalize-prompt-instructions.module';
import { ResolveAgentModule } from './ResolveAgent/resolve-agent.module';
import { UpdateAgentModule } from './UpdateAgent/update-agent.module';

@Module({
  imports: [
    ConvertTextToSpeechModule,
    ExecuteSimilaritySearchModule,
    LoadAiChatModule,
    LoadVectorStoreModule,
    GenerateAgentSourceModule,
    BuildSystemPromptModule,
    NormalizePromptInstructionsModule,
    GenerateAiResponseModule,
    CreateAgentModule,
    ResolveAgentModule,
    UpdateAgentModule,
    ListAgentsModule,
    CreateAttendantAgentModule,
    LoadAgentSitesModule,
    LoadVectorSearchToolModule,
  ],
  exports: [
    ConvertTextToSpeechModule,
    ExecuteSimilaritySearchModule,
    LoadAiChatModule,
    LoadVectorStoreModule,
    GenerateAgentSourceModule,
    BuildSystemPromptModule,
    NormalizePromptInstructionsModule,
    GenerateAiResponseModule,
    CreateAgentModule,
    ResolveAgentModule,
    UpdateAgentModule,
    ListAgentsModule,
    CreateAttendantAgentModule,
    LoadAgentSitesModule,
    LoadVectorSearchToolModule,
  ],
})
export class ArtificialIntelligenceModule {}
