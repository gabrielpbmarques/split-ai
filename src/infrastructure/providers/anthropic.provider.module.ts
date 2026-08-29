import { Module } from '@nestjs/common';

import { AnthropicProvider, ANTHROPIC_CHAT } from './anthropic.provider';

@Module({
  providers: [...AnthropicProvider],
  exports: [ANTHROPIC_CHAT],
})
export class AnthropicProviderModule {}
