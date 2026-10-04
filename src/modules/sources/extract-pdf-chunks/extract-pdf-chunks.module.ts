import { Module } from '@nestjs/common';

import { ExtractPdfChunksService } from 'src/modules/sources/extract-pdf-chunks/extract-pdf-chunks.service';

@Module({
  providers: [ExtractPdfChunksService],
  exports: [ExtractPdfChunksService],
})
export class ExtractPdfChunksModule {}
