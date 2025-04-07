import { ChatVertexAI } from '@langchain/google-vertexai';
import { config } from 'src/config';
import { AIInstructions } from 'src/types/AIInstructions';
import { RunnableChatOpts } from 'src/types/RunnableChatOpts';

interface Agent {
  instructions: AIInstructions;
  chat: ChatVertexAI;
  runnableOpts: RunnableChatOpts;
}

type ValidAgentKeys = 'register_chat';

type AgentType = {
  [key in ValidAgentKeys]: Agent;
};

const agents: AgentType = {
  register_chat: {
    instructions: config.registerChatInstructions,
    chat: new ChatVertexAI({
      model: config.aiModel,
      temperature: 0.4,
    }),
    runnableOpts: {
      withHistory: false,
    },
  },
};

export { agents, Agent };
