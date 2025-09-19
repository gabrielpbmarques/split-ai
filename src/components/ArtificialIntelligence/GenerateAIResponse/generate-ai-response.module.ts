import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { LoadAiChatModule } from '../LoadAiChat/load-ai-chat.module';

import { GenerateAiResponseService } from './generate-ai-response.service';

@Module({
  imports: [RepositoriesModule, LoadAiChatModule],
  providers: [GenerateAiResponseService],
  exports: [GenerateAiResponseService],
})
export class GenerateAiResponseModule {}
