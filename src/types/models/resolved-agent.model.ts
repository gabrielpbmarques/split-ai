import { ChatVertexAI } from '@langchain/google-vertexai';

import { AIInstructions } from './ai-instructions.model';
import { RunnableChatOpts } from './runnable-chat-opts.model';

export interface ResolvedAgent {
  id?: string;
  instructions: AIInstructions;
  chat: ChatVertexAI;
  jsonParser?: any;
  runnableOpts: RunnableChatOpts;
  sites?: string[];
}
