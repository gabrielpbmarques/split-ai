import { Module } from '@nestjs/common';
import { NormalizePromptInstructionsService } from './normalize-prompt-instructions.service';

@Module({
  providers: [NormalizePromptInstructionsService],
})
export class NormalizePromptInstructionsModule {}
