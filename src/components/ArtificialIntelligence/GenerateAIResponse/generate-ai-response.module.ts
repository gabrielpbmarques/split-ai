import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { GenerateAiResponseService } from './generate-ai-response.service';
import { LoadAiChatModule } from '../LoadAiChat/load-ai-chat.module';

@Module({
  imports: [RepositoriesModule, LoadAiChatModule],
  providers: [GenerateAiResponseService],
  exports: [GenerateAiResponseService],
})
export class GenerateAiResponseModule {}
