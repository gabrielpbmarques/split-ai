import { Module } from '@nestjs/common';
import { FillPromptService } from './fill-prompt.service';
import { BuildSystemPromptModule } from '../BuildSystemPrompt/build-system-prompt.module';

@Module({
  imports: [BuildSystemPromptModule],
  providers: [FillPromptService],
  exports: [FillPromptService],
})
export class FillPromptModule {}
