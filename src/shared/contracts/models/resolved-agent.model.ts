import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import type { createAgent } from 'langchain';

import type { AgentTool } from 'src/shared/contracts/models/agent-tool.model';
import type { RunnableChatOpts } from 'src/shared/contracts/models/runnable-chat-opts.model';

export type AgentRunnable = ReturnType<typeof createAgent>;

export interface ResolvedAgent {
  id: string;
  systemPrompt: string;
  chat: BaseChatModel;
  runnableOpts: RunnableChatOpts;
  tools?: AgentTool[];
  sites?: string[];
  runnable: AgentRunnable;
}
