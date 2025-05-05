import { Module } from '@nestjs/common';
import { ExtractPdfChunksService } from './extract-pdf-chunks.service';

@Module({
  providers: [ExtractPdfChunksService],
  exports: [ExtractPdfChunksService],
})
export class ExtractPdfChunksModule {}
