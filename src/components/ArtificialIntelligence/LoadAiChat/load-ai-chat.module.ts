import { Module } from '@nestjs/common';

import { LoadCheckpointerModule } from '../LoadCheckpointer/load-checkpointer.module';

import { LoadAiChatService } from './load-ai-chat.service';

@Module({
  imports: [LoadCheckpointerModule],
  providers: [LoadAiChatService],
  exports: [LoadAiChatService],
})
export class LoadAiChatModule {}
