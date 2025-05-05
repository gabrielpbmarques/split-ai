import { Module } from '@nestjs/common';
import { ProcessPdfService } from './process-pdf.service';
import { ExtractPdfChunksModule } from '../ExtractPdfChunks/extract-pdf-chunks.module';

@Module({
  imports: [ExtractPdfChunksModule],
  providers: [ProcessPdfService],
  exports: [ProcessPdfService],
})
export class ProcessPdfModule {}
