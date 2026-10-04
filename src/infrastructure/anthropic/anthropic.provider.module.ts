import { Module } from '@nestjs/common';

import { AnthropicProvider } from 'src/infrastructure/anthropic/anthropic.provider';
import { ANTHROPIC_CHAT } from 'src/infrastructure/anthropic/anthropic.tokens';

@Module({
  providers: [...AnthropicProvider],
  exports: [ANTHROPIC_CHAT],
})
export class AnthropicProviderModule {}
