import { Module } from '@nestjs/common';
import { LoadVectorSearchToolModule } from 'src/components/Tools/LoadVectorSearchTool/load-vector-search-tool.module';

import { TokenUsageModule } from '../TokenUsage/token-usage.module';

import { AppendConnectionToolsModule } from './AppendConnectionTools/append-connection-tools.module';
import { BuildSystemPromptModule } from './BuildSystemPrompt/build-system-prompt.module';
import { ConvertTextToSpeechModule } from './ConvertTextToSpeech/convert-text-to-speech.module';
import { CreateAgentModule } from './CreateAgent/create-agent.module';
import { CreateAttendantAgentModule } from './CreateAttendantAgent/create-attendant-agent.module';
import { ExecuteSimilaritySearchModule } from './ExecuteSimilaritySearch/execute-similarity-search.module';
import { GenerateAiResponseModule } from './GenerateAIResponse/generate-ai-response.module';
import { InvokeConnectedAgentModule } from './InvokeConnectionAgent/invoke-connected-agent.module';
import { ListAgentsModule } from './ListAgents/list-agents.module';
import { LoadAgentSitesModule } from './LoadAgentSites/load-agent-sites.module';
import { LoadVectorStoreModule } from './LoadVectorStore/load-vector-store.module';
import { NormalizePromptInstructionsModule } from './NormalizePromptInstructions/normalize-prompt-instructions.module';
import { ResolveAgentModule } from './ResolveAgent/resolve-agent.module';
import { UpdateAgentModule } from './UpdateAgent/update-agent.module';

@Module({
  imports: [
    ConvertTextToSpeechModule,
    ExecuteSimilaritySearchModule,
    LoadVectorStoreModule,
    BuildSystemPromptModule,
    NormalizePromptInstructionsModule,
    GenerateAiResponseModule,
    CreateAgentModule,
    UpdateAgentModule,
    ListAgentsModule,
    CreateAttendantAgentModule,
    LoadAgentSitesModule,
    LoadVectorSearchToolModule,
    TokenUsageModule,
    ResolveAgentModule,
    InvokeConnectedAgentModule,
    AppendConnectionToolsModule,
  ],
})
export class ArtificialIntelligenceModule {}
