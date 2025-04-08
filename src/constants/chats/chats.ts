import { ChatVertexAI } from '@langchain/google-vertexai';
import { config } from 'src/config';
import { AIInstructions } from 'src/types/AIInstructions';
import { RunnableChatOpts } from 'src/types/RunnableChatOpts';

interface Agent {
  instructions: AIInstructions;
  chat: ChatVertexAI;
  runnableOpts: RunnableChatOpts;
}

type ValidAgentKeys = 'register_chat' | 'whatsapp_register';

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
      withHistory: true,
    },
  },
  whatsapp_register: {
    instructions: config.whatsappRegisterInstructions,
    chat: new ChatVertexAI({
      model: config.aiModel,
      temperature: 0.7, // Um pouco mais de criatividade para o WhatsApp
    }),
    runnableOpts: {
      withHistory: true,
    },
  },
};

export { agents, Agent };
