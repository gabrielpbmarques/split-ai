import { Module } from '@nestjs/common';
import { LoadAiChatModule } from 'src/components/ArtificialIntelligence/LoadAiChat/load-ai-chat.module';
import { SupabaseRepositoriesModule } from 'src/supabase-repositories/supabase-repositories.module';

import { GenerateAiResponseService } from './generate-ai-response.service';

@Module({
  imports: [LoadAiChatModule, SupabaseRepositoriesModule],
  providers: [GenerateAiResponseService],
  exports: [GenerateAiResponseService],
})
export class GenerateAiResponseModule {}
