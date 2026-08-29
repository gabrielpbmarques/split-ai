import { Module } from '@nestjs/common';

import {
  VoyageEmbeddingsProvider,
  VOYAGE_EMBEDDINGS,
} from './voyage-embeddings.provider';

@Module({
  providers: [...VoyageEmbeddingsProvider],
  exports: [VOYAGE_EMBEDDINGS],
})
export class VoyageEmbeddingsProviderModule {}
