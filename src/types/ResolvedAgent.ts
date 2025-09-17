import { ChatVertexAI } from '@langchain/google-vertexai';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { AIInstructions } from './AIInstructions';
import { RunnableChatOpts } from './RunnableChatOpts';

export interface ResolvedAgent {
  instructions: AIInstructions;
  chat: ChatVertexAI;
  jsonParser?: DynamicStructuredTool<z.ZodObject<any>>;
  runnableOpts: RunnableChatOpts;
}
