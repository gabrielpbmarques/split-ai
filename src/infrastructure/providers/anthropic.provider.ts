import { ChatAnthropic } from '@langchain/anthropic';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { FakeListChatModel } from '@langchain/core/utils/testing';
import { type Provider, ServiceUnavailableException } from '@nestjs/common';

import { env } from 'src/shared/config/env';

export const ANTHROPIC_CLIENT = 'ANTHROPIC_CLIENT';
export const CHAT_MODEL_SERVICE = 'CHAT_MODEL_SERVICE';

export interface ChatModelOptions {
  readonly model?: string | null;
  readonly temperature?: number | null;
}

export interface IChatModelService {
  create(options?: ChatModelOptions): BaseChatModel;
}

const DEFAULT_TEMPERATURE = 0.4;
const DEFAULT_RESPONSES = [
  JSON.stringify({ response: 'Resposta simulada do assistente.' }),
];

class AnthropicChatModelService implements IChatModelService {
  create(options: ChatModelOptions = {}): BaseChatModel {
    const model = options.model || env.AI_MODEL;

    if (!env.ANTHROPIC_API_KEY || !model) {
      throw new ServiceUnavailableException('Anthropic não configurado');
    }

    return new ChatAnthropic({
      model,
      apiKey: env.ANTHROPIC_API_KEY,
      temperature: options.temperature ?? DEFAULT_TEMPERATURE,
      clientOptions: { baseURL: env.ANTHROPIC_BASE_URL },
    });
  }
}

class MockChatModelService implements IChatModelService {
  constructor(
    private readonly responses: readonly string[] = DEFAULT_RESPONSES,
  ) {}

  create(): BaseChatModel {
    return new FakeListChatModel({ responses: [...this.responses] });
  }
}

export const AnthropicProvider: Provider[] = [
  {
    provide: CHAT_MODEL_SERVICE,
    useFactory: (): IChatModelService => {
      if (env.INTEGRATION_MODE === 'mock') {
        return new MockChatModelService();
      }
      return new AnthropicChatModelService();
    },
  },
];
