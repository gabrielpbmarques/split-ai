import { ChatAnthropic } from '@langchain/anthropic';
import { Provider } from '@nestjs/common';

import { ANTHROPIC_CHAT } from 'src/infrastructure/anthropic/anthropic.tokens';
import { env } from 'src/shared/config/env';

export const AnthropicProvider: Provider[] = [
  {
    provide: ANTHROPIC_CHAT,
    useFactory: (): ChatAnthropic => {
      if (!env.AI_MODEL) {
        throw new Error('AI model must be provided');
      }

      return new ChatAnthropic({
        model: env.AI_MODEL,
        temperature: 0.4,
        clientOptions: {
          baseURL: 'https://api.deepseek.com/anthropic',
        },
      });
    },
  },
];
