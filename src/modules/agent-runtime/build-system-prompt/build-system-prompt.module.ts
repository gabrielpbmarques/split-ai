import { Module } from '@nestjs/common';

import { BuildSystemPromptService } from 'src/modules/agent-runtime/build-system-prompt/build-system-prompt.service';

@Module({
  providers: [BuildSystemPromptService],
  exports: [BuildSystemPromptService],
})
export class BuildSystemPromptModule {}
