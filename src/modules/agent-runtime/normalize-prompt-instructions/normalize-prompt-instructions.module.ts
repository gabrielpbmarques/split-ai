import { Module } from '@nestjs/common';

import { NormalizePromptInstructionsService } from 'src/modules/agent-runtime/normalize-prompt-instructions/normalize-prompt-instructions.service';

@Module({
  providers: [NormalizePromptInstructionsService],
  exports: [NormalizePromptInstructionsService],
})
export class NormalizePromptInstructionsModule {}
