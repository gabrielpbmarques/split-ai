import { Module } from '@nestjs/common';
import { FillPromptService } from 'src/components/Prompt/FillPrompt/fill-prompt.service';
import { BuildSystemPromptModule } from 'src/components/Prompt/BuildSystemPrompt/build-system-prompt.module';

@Module({
  imports: [BuildSystemPromptModule],
  providers: [FillPromptService],
  exports: [FillPromptService],
})
export class FillPromptModule {}
