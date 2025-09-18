import { Module } from '@nestjs/common';
import { SupabaseRepositoriesModule } from 'src/supabase-repositories/supabase-repositories.module';

import { GenerateAiResponseService } from './generate-ai-response.service';
import { LoadAiChatModule } from '../LoadAiChat/load-ai-chat.module';

@Module({
  imports: [SupabaseRepositoriesModule, LoadAiChatModule],
  providers: [GenerateAiResponseService],
  exports: [GenerateAiResponseService],
})
export class GenerateAiResponseModule {}
