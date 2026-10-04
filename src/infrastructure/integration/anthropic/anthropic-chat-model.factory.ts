import { ChatAnthropic } from '@langchain/anthropic';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';

import type {
  ChatModelFactory,
  ChatModelOptions,
} from 'src/infrastructure/integration/chat-model.port';
import {
  type IntegrationState,
  notConfigured,
} from 'src/infrastructure/integration/integration.state';
import { env } from 'src/shared/config/env';

const DEFAULT_TEMPERATURE = 0.4;

export class AnthropicChatModelFactory implements ChatModelFactory {
  readonly name = 'anthropic';

  state(): IntegrationState {
    return env.ANTHROPIC_API_KEY && env.AI_MODEL ? 'READY' : 'NOT_CONFIGURED';
  }

  create(options: ChatModelOptions = {}): BaseChatModel {
    const model = options.model || env.AI_MODEL;

    if (!env.ANTHROPIC_API_KEY || !model) {
      notConfigured(this.name);
    }

    return new ChatAnthropic({
      model,
      apiKey: env.ANTHROPIC_API_KEY,
      temperature: options.temperature ?? DEFAULT_TEMPERATURE,
      clientOptions: { baseURL: env.ANTHROPIC_BASE_URL },
    });
  }
}
