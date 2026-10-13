import { Module } from '@nestjs/common';

import { ResolveSystemPromptService } from 'src/modules/agent-runtime/resolve-system-prompt/resolve-system-prompt.service';

@Module({
  providers: [ResolveSystemPromptService],
  exports: [ResolveSystemPromptService],
})
export class ResolveSystemPromptModule {}
