import { VoyageEmbeddings } from '@langchain/community/embeddings/voyage';
import { Provider } from '@nestjs/common';
import { env } from 'src/shared/config/env';

export const VOYAGE_EMBEDDINGS = 'VOYAGE_EMBEDDINGS';

const DEFAULT_OUTPUT_DIMENSION = 1024;

export const VoyageEmbeddingsProvider: Provider[] = [
  {
    provide: VOYAGE_EMBEDDINGS,
    useFactory: (): VoyageEmbeddings => {
      if (!env.EMBEDDING_MODEL) {
        throw new Error('Embedding model must be provided');
      }

      return new VoyageEmbeddings({
        modelName: env.EMBEDDING_MODEL,
        outputDimension: DEFAULT_OUTPUT_DIMENSION,
      });
    },
  },
];
