import { ChatVertexAI } from '@langchain/google-vertexai';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { AIInstructions } from './ai-instructions.model';
import { RunnableChatOpts } from './runnable-chat-opts.model';

export interface ResolvedAgent {
  id?: string;
  instructions: AIInstructions;
  chat: ChatVertexAI;
  jsonParser?: DynamicStructuredTool<z.ZodObject<any>>;
  runnableOpts: RunnableChatOpts;
}
