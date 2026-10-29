import { Module } from '@nestjs/common';

import { AntiPromptInjectionService } from 'src/modules/subagents/anti-prompt-injection/anti-prompt-injection.service';

@Module({
  providers: [AntiPromptInjectionService],
  exports: [AntiPromptInjectionService],
})
export class AntiPromptInjectionModule {}
