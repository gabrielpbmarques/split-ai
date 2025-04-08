import { Module } from '@nestjs/common';
import { BuildSystemPromptService } from './build-system-prompt.service';
import { NormalizePromptInstructionsModule } from '../NormalizePromptInstructions/normalize-prompt-instructions.module';

@Module({
  imports: [NormalizePromptInstructionsModule],
  providers: [BuildSystemPromptService],
  exports: [BuildSystemPromptService],
})
export class BuildSystemPromptModule {}
