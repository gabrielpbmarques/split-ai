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
      // Usando casting para contornar limitações de tipagem
      // Isso permite usar recursos mais recentes da API que ainda não estão nas definições de tipo
      ...({
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'object',
            properties: {
              name: { type: 'string', nullable: true },
              nickname: { type: 'string', nullable: true },
              phone: {
                type: 'object',
                nullable: true,
                properties: {
                  countryCode: { type: 'string' },
                  areaCode: { type: 'string' },
                  number: { type: 'string' },
                },
                required: ['countryCode', 'areaCode', 'number'],
              },
              bankInfo: {
                type: 'object',
                nullable: true,
                properties: {
                  bankCode: { type: 'string' },
                  agency: { type: 'string' },
                  account: { type: 'string' },
                  accountDigit: { type: 'string' },
                  type: { type: 'string' },
                  name: { type: 'string' },
                  cpf: { type: 'string' },
                },
              },
              email: { type: 'string', nullable: true },
              birthDate: { type: 'string', nullable: true },
              cpf: { type: 'string', nullable: true },
              gender: {
                type: 'string',
                enum: ['female', 'male', 'uninformed'],
                nullable: true,
              },
              comunication: {
                type: 'object',
                nullable: true,
                properties: {
                  agree: { type: 'boolean' },
                },
                required: ['agree'],
              },
              terms: {
                type: 'object',
                nullable: true,
                properties: {
                  agree: { type: 'boolean' },
                },
                required: ['agree'],
              },
              image: {
                type: 'object',
                nullable: true,
                properties: {
                  type: {
                    type: 'string',
                    enum: ['document_front', 'document_back', 'profile'],
                  },
                  url: { type: 'string' },
                },
              },
              hasLegalAge: { type: 'boolean', nullable: true },
              status: { type: 'string', enum: ['pending', 'inAnalysis'] },
              signupStage: {
                type: 'string',
                enum: [
                  'personal_info',
                  'address',
                  'profile_picture',
                  'document',
                  'bank_account',
                  'chains',
                  'end',
                ],
              },
              fieldsToUpdate: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: [
                    'name',
                    'nickname',
                    'phone',
                    'email',
                    'birthDate',
                    'cpf',
                    'gender',
                    'comunication',
                    'terms',
                    'hasLegalAge',
                    'address.zipCode',
                    'address.street',
                    'address.number',
                    'address.complement',
                    'address.neighborhood',
                    'address.city',
                    'address.state',
                    'address.country',
                    'address.cityCode',
                    'profilePicture',
                    'document.type',
                    'document.number',
                    'document.frontImage',
                    'document.backImage',
                    'document.selfieImage',
                    'bankAccount.bankCode',
                    'bankAccount.agency',
                    'bankAccount.account',
                    'bankAccount.accountDigit',
                    'bankAccount.type',
                    'bankAccount.pixKey',
                    'chains',
                  ],
                },
                nullable: true,
              },
              address: {
                type: 'object',
                nullable: true,
                properties: {
                  zipCode: { type: 'string' },
                  street: { type: 'string' },
                  number: { type: 'string' },
                  complement: { type: 'string', nullable: true },
                  neighborhood: { type: 'string' },
                  city: { type: 'string' },
                  state: { type: 'string' },
                  country: { type: 'string' },
                  cityCode: { type: 'number', nullable: true },
                },
              },
              invalidFields: {
                type: 'object',
                nullable: true,
                additionalProperties: {
                  type: 'object',
                  properties: {
                    value: { type: 'string' },
                    reason: { type: 'string' },
                  },
                  required: ['value', 'reason'],
                },
              },
              required: ['status', 'signupStage'],
            },
          },
        },
      } as any),
    }),
    runnableOpts: {
      withHistory: true,
    },
  },
};

export { agents, Agent };
