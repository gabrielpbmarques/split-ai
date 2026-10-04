import { VoyageEmbeddings } from '@langchain/community/embeddings/voyage';
import { Embeddings } from '@langchain/core/embeddings';

import { notConfigured } from 'src/infrastructure/integration/integration.state';
import { env } from 'src/shared/config/env';

const OUTPUT_DIMENSION = 1024;

class UnavailableEmbeddings extends Embeddings {
  constructor() {
    super({});
  }

  async embedDocuments(): Promise<number[][]> {
    return notConfigured('voyage-embeddings');
  }

  async embedQuery(): Promise<number[]> {
    return notConfigured('voyage-embeddings');
  }
}

export function isVoyageEmbeddingsConfigured(): boolean {
  return Boolean(env.VOYAGEAI_API_KEY && env.EMBEDDING_MODEL);
}

export function createVoyageEmbeddings(): Embeddings {
  if (!isVoyageEmbeddingsConfigured()) {
    return new UnavailableEmbeddings();
  }

  const embeddings = new VoyageEmbeddings({
    apiKey: env.VOYAGEAI_API_KEY,
    modelName: env.EMBEDDING_MODEL,
    outputDimension: OUTPUT_DIMENSION,
  });

  return embeddings as unknown as Embeddings;
}
