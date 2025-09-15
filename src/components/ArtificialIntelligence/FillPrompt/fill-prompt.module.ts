import { Module } from '@nestjs/common';
import { BuildSystemPromptModule } from 'src/components/ArtificialIntelligence/BuildSystemPrompt/build-system-prompt.module';

import { FillPromptService } from './fill-prompt.service';

@Module({
  imports: [BuildSystemPromptModule],
  providers: [FillPromptService],
  exports: [FillPromptService],
})
export class FillPromptModule {}
