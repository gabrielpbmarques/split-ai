import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import type { createAgent } from 'langchain';

import type { AgentTool } from 'src/shared/contracts/models/agent-tool.model';

export type AgentRunnable = ReturnType<typeof createAgent>;

export interface ResolvedAgent {
  id: string;
  chat: BaseChatModel;
  tools?: AgentTool[];
}
