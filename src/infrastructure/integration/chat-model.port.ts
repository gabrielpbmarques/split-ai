import type { BaseChatModel } from '@langchain/core/language_models/chat_models';

import type { IntegrationGateway } from 'src/infrastructure/integration/integration.state';

export const CHAT_MODEL = Symbol('CHAT_MODEL');

export interface ChatModelOptions {
  readonly model?: string | null;
  readonly temperature?: number | null;
}

export interface ChatModelFactory extends IntegrationGateway {
  create(options?: ChatModelOptions): BaseChatModel;
}
