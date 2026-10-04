import { VoyageEmbeddings } from '@langchain/community/embeddings/voyage';
import { Provider } from '@nestjs/common';

import { VOYAGE_EMBEDDINGS } from 'src/infrastructure/voyage-embeddings/voyage-embeddings.tokens';
import { env } from 'src/shared/config/env';

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
