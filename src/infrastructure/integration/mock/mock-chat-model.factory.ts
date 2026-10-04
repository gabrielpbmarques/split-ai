import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { FakeListChatModel } from '@langchain/core/utils/testing';

import { ChatModelFactory } from 'src/infrastructure/integration/chat-model.port';
import { IntegrationState } from 'src/infrastructure/integration/integration.state';

const DEFAULT_RESPONSES = [
  JSON.stringify({ response: 'Resposta simulada do assistente.' }),
];

export class MockChatModelFactory implements ChatModelFactory {
  readonly name = 'anthropic';

  constructor(
    private readonly responses: readonly string[] = DEFAULT_RESPONSES,
  ) {}

  state(): IntegrationState {
    return 'MOCK';
  }

  create(): BaseChatModel {
    return new FakeListChatModel({ responses: [...this.responses] });
  }
}
