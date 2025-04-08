import { Provider } from '@nestjs/common';
import { ChatVertexAI, VertexAIEmbeddings } from '@langchain/google-vertexai';
import { config } from 'src/config';

export const VERTEX_AI_EMBEDDINGS = 'VERTEX_AI_EMBEDDINGS';
export const VERTEX_AI_CHAT = 'VERTEX_AI_CHAT';

export const VertexAIProvider: Provider[] = [
  {
    provide: VERTEX_AI_EMBEDDINGS,
    useFactory: (): VertexAIEmbeddings => {
      if (!config.aiModel) {
        throw new Error('AI model must be provided');
      }

      return new VertexAIEmbeddings({
        model: config.aiModel,
      });
    },
  },
  {
    provide: VERTEX_AI_CHAT,
    useFactory: (): ChatVertexAI => {
      if (!config.aiModel) {
        throw new Error('AI model must be provided');
      }

      return new ChatVertexAI({
        model: config.aiModel,
        temperature: 0.4,
      });
    },
  },
];
