import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import type { createAgent, DynamicStructuredTool } from 'langchain';
import { z } from 'zod';

import { RunnableChatOpts } from 'src/shared/contracts/models/runnable-chat-opts.model';

export type AgentRunnable = ReturnType<typeof createAgent>;

export interface ResolvedAgent {
  id?: string;
  systemPrompt: string;
  chat: BaseChatModel;
  runnableOpts: RunnableChatOpts;
  tools?: DynamicStructuredTool<z.ZodObject<any>>[];
  sites?: string[];
  organization_id?: string;
  runnable: AgentRunnable;
}
