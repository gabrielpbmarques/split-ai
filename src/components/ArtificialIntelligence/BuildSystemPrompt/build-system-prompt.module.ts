import { Module } from '@nestjs/common';
import { NormalizePromptInstructionsModule } from 'src/components/ArtificialIntelligence/NormalizePromptInstructions/normalize-prompt-instructions.module';

import { BuildSystemPromptService } from './build-system-prompt.service';

@Module({
  imports: [NormalizePromptInstructionsModule],
  providers: [BuildSystemPromptService],
  exports: [BuildSystemPromptService],
})
export class BuildSystemPromptModule {}
