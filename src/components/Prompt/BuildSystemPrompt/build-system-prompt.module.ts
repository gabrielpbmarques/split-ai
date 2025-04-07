import { Module } from '@nestjs/common';
import { BuildSystemPromptService } from './build-system-prompt.service';
import { NormalizePromptInstructionsService } from '../NormalizePromptInstructions/normalize-prompt-instructions.service';

@Module({
  providers: [BuildSystemPromptService, NormalizePromptInstructionsService],
})
export class BuildSystemPromptModule {}
