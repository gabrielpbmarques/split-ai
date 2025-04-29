import { Module } from '@nestjs/common';
import { BuildSystemPromptModule } from 'src/components/Prompt/BuildSystemPrompt/build-system-prompt.module';
import { FillPromptModule } from 'src/components/Prompt/FillPrompt/fill-prompt.module';
import { NormalizePromptInstructionsModule } from 'src/components/Prompt/NormalizePromptInstructions/normalize-prompt-instructions.module';

@Module({
  imports: [
    BuildSystemPromptModule,
    FillPromptModule,
    NormalizePromptInstructionsModule,
  ],
  exports: [
    BuildSystemPromptModule,
    FillPromptModule,
    NormalizePromptInstructionsModule,
  ],
})
export class PromptModule {}
