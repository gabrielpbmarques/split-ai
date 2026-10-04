import { Module } from '@nestjs/common';

import { VoyageRerankProvider } from 'src/infrastructure/voyage-rerank/voyage-rerank.provider';
import { VOYAGE_RERANK_SERVICE } from 'src/infrastructure/voyage-rerank/voyage-rerank.tokens';

@Module({
  providers: [...VoyageRerankProvider],
  exports: [VOYAGE_RERANK_SERVICE],
})
export class VoyageRerankProviderModule {}
