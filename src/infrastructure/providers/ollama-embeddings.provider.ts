import { OllamaEmbeddings } from '@langchain/ollama';
import { Provider } from '@nestjs/common';
import { config } from 'src/config';

export const EMBEDDINGS = 'EMBEDDINGS';

export const OllamaEmbeddingsProvider: Provider[] = [
  {
    provide: EMBEDDINGS,
    useFactory: (): OllamaEmbeddings => {
      if (!config.embeddingModel) {
        throw new Error('EMBEDDING_MODEL must be provided');
      }
      if (!config.ollamaBaseUrl) {
        throw new Error('OLLAMA_BASE_URL must be provided');
      }

      return new OllamaEmbeddings({
        model: config.embeddingModel,
        baseUrl: config.ollamaBaseUrl,
      });
    },
  },
];
