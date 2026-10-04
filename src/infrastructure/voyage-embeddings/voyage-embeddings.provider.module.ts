import { Module } from '@nestjs/common';

import { VoyageEmbeddingsProvider } from 'src/infrastructure/voyage-embeddings/voyage-embeddings.provider';
import { VOYAGE_EMBEDDINGS } from 'src/infrastructure/voyage-embeddings/voyage-embeddings.tokens';

@Module({
  providers: [...VoyageEmbeddingsProvider],
  exports: [VOYAGE_EMBEDDINGS],
})
export class VoyageEmbeddingsProviderModule {}
