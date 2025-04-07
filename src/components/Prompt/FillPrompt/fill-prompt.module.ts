import { Module } from '@nestjs/common';
import { FillPromptService } from './fill-prompt.service';
import { BuildSystemPromptService } from '../BuildSystemPrompt/build-system-prompt.service';

@Module({
  providers: [FillPromptService, BuildSystemPromptService],
})
export class FillPromptModule {}
