import { Module } from '@nestjs/common';

import { BuildSystemPromptModule } from '../BuildSystemPrompt/build-system-prompt.module';
import { LoadCheckpointerModule } from '../LoadCheckpointer/load-checkpointer.module';
import { LoadDatabaseToolModule } from '../LoadDatabaseTool/load-database-tool.module';

import { LoadAiChatService } from './load-ai-chat.service';

@Module({
  imports: [
    LoadCheckpointerModule,
    BuildSystemPromptModule,
    LoadDatabaseToolModule,
  ],
  providers: [LoadAiChatService],
  exports: [LoadAiChatService],
})
export class LoadAiChatModule {}
