import { Module } from '@nestjs/common';
import { BuildSystemPromptService } from 'src/components/Prompt/BuildSystemPrompt/build-system-prompt.service';
import { NormalizePromptInstructionsModule } from 'src/components/Prompt/NormalizePromptInstructions/normalize-prompt-instructions.module';

@Module({
  imports: [NormalizePromptInstructionsModule],
  providers: [BuildSystemPromptService],
  exports: [BuildSystemPromptService],
})
export class BuildSystemPromptModule {}
