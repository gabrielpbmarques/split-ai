import { VoyageEmbeddings } from '@langchain/community/embeddings/voyage';
import { Provider } from '@nestjs/common';
import { config } from 'src/config';

export const VOYAGE_EMBEDDINGS = 'VOYAGE_EMBEDDINGS';

const DEFAULT_OUTPUT_DIMENSION = 1024;

export const VoyageEmbeddingsProvider: Provider[] = [
  {
    provide: VOYAGE_EMBEDDINGS,
    useFactory: (): VoyageEmbeddings => {
      if (!config.embeddingModel) {
        throw new Error('Embedding model must be provided');
      }

      return new VoyageEmbeddings({
        modelName: config.embeddingModel,
        outputDimension: DEFAULT_OUTPUT_DIMENSION,
      });
    },
  },
];
