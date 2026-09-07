import { Module } from '@nestjs/common';

import {
  VoyageRerankProvider,
  VOYAGE_RERANK_SERVICE,
} from './voyage-rerank.provider';

@Module({
  providers: [...VoyageRerankProvider],
  exports: [VOYAGE_RERANK_SERVICE],
})
export class VoyageRerankProviderModule {}
