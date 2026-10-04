import { Module } from '@nestjs/common';

import { BuildSystemPromptService } from 'src/modules/agent-runtime/build-system-prompt/build-system-prompt.service';
import { NormalizePromptInstructionsModule } from 'src/modules/agent-runtime/normalize-prompt-instructions/normalize-prompt-instructions.module';

@Module({
  imports: [NormalizePromptInstructionsModule],
  providers: [BuildSystemPromptService],
  exports: [BuildSystemPromptService],
})
export class BuildSystemPromptModule {}
