import { Module } from '@nestjs/common';
import { LoadAiChatModule } from 'src/components/ArtificialIntelligence/LoadAiChat/load-ai-chat.module';
import { SupabaseRepositoriesModule } from 'src/supabase-repositories/supabase-repositories.module';
import { ResolveAgentModule } from 'src/components/ArtificialIntelligence/ResolveAgent/resolve-agent.module';

import { GenerateAiResponseService } from './generate-ai-response.service';

@Module({
  imports: [LoadAiChatModule, SupabaseRepositoriesModule, ResolveAgentModule],
  providers: [GenerateAiResponseService],
  exports: [GenerateAiResponseService],
})
export class GenerateAiResponseModule {}
