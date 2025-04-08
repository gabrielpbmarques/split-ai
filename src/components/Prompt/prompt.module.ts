import { Module } from '@nestjs/common';
import { BuildSystemPromptModule } from './BuildSystemPrompt/build-system-prompt.module';
import { FillPromptModule } from './FillPrompt/fill-prompt.module';
import { NormalizePromptInstructionsModule } from './NormalizePromptInstructions/normalize-prompt-instructions.module';

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
