import { ChatVertexAI } from '@langchain/google-vertexai';
import type { createAgent, DynamicStructuredTool } from 'langchain';
import { z } from 'zod';

import { RunnableChatOpts } from './runnable-chat-opts.model';

export type AgentRunnable = ReturnType<typeof createAgent>;

export interface ResolvedAgent {
  id?: string;
  systemPrompt: string;
  chat: ChatVertexAI;
  runnableOpts: RunnableChatOpts;
  tools?: DynamicStructuredTool<z.ZodObject<any>>[];
  sites?: string[];
  organization_id?: string;
  runnable: AgentRunnable;
}
