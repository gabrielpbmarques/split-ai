import { Module } from '@nestjs/common';
import { LoadPdfModule } from './LoadPdf/load-pdf.module';
import { ProcessPdfModule } from './ProcessPdf/process-pdf.module';
import { ExtractPdfChunksModule } from './ExtractPdfChunks/extract-pdf-chunks.module';

@Module({
  imports: [LoadPdfModule, ProcessPdfModule, ExtractPdfChunksModule],
  exports: [LoadPdfModule],
})
export class PdfModule {}
