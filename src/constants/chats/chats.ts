import { ChatVertexAI } from '@langchain/google-vertexai';
import { config } from 'src/config';
import { AIInstructions } from 'src/types/AIInstructions';
import { RunnableChatOpts } from 'src/types/RunnableChatOpts';

interface Agent {
  instructions: AIInstructions;
  chat: ChatVertexAI;
  runnableOpts: RunnableChatOpts;
}

type ValidAgentKeys =
  | 'register_chat'
  | 'whatsapp_register'
  | 'message_data_parser';

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
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_ONLY_HIGH',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_ONLY_HIGH',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_ONLY_HIGH',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_ONLY_HIGH',
        },
      ],
    }),
    runnableOpts: {
      withHistory: true,
    },
  },
  message_data_parser: {
    instructions: config.messageDataParser,
    chat: new ChatVertexAI({
      model: config.aiModel,
      temperature: 0.4,
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_ONLY_HIGH',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_ONLY_HIGH',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_ONLY_HIGH',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_ONLY_HIGH',
        },
      ],
    }),
    runnableOpts: {
      withHistory: true,
    },
  },
};

export { agents, Agent };
