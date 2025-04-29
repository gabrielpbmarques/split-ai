import { Module } from '@nestjs/common';
import { NormalizePromptInstructionsService } from 'src/components/Prompt/NormalizePromptInstructions/normalize-prompt-instructions.service';

@Module({
  providers: [NormalizePromptInstructionsService],
  exports: [NormalizePromptInstructionsService],
})
export class NormalizePromptInstructionsModule {}
