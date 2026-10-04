import { Module } from '@nestjs/common';

import { RerankDocumentsService } from 'src/modules/retrieval/rerank-documents/rerank-documents.service';

@Module({
  providers: [RerankDocumentsService],
  exports: [RerankDocumentsService],
})
export class RerankDocumentsModule {}
