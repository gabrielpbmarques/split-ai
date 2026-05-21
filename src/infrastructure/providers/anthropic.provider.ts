export const ANTHROPIC_CHAT = 'ANTHROPIC_CHAT';

import { ChatAnthropic } from '@langchain/anthropic';
import { Provider } from '@nestjs/common';
import { config } from 'src/config';

export const AnthropicProvider: Provider[] = [
  {
    provide: ANTHROPIC_CHAT,
    useFactory: (): ChatAnthropic => {
      if (!config.aiModel) {
        throw new Error('AI model must be provided');
      }

      return new ChatAnthropic({
        model: config.aiModel,
        temperature: 0.4,
      });
    },
  },
];
