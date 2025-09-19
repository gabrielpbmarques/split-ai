export const VERTEX_AI_EMBEDDINGS = 'VERTEX_AI_EMBEDDINGS';
export const VERTEX_AI_CHAT = 'VERTEX_AI_CHAT';

import { ChatVertexAI, VertexAIEmbeddings } from '@langchain/google-vertexai';
import { Provider } from '@nestjs/common';
import { config } from 'src/config';

export const VertexAIProvider: Provider[] = [
  {
    provide: VERTEX_AI_EMBEDDINGS,
    useFactory: (): VertexAIEmbeddings => {
      if (!config.embeddingModel) {
        throw new Error('Embedding model must be provided');
      }

      return new VertexAIEmbeddings({
        model: config.embeddingModel,
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
