import { Module } from '@nestjs/common';

import { ExtractPdfChunksModule } from '../ExtractPdfChunks/extract-pdf-chunks.module';

import { ProcessPdfService } from './process-pdf.service';

@Module({
  imports: [ExtractPdfChunksModule],
  providers: [ProcessPdfService],
  exports: [ProcessPdfService],
})
export class ProcessPdfModule {}
