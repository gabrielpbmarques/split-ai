import { Module } from '@nestjs/common';

import { ExtractPdfChunksModule } from 'src/modules/sources/extract-pdf-chunks/extract-pdf-chunks.module';
import { ProcessPdfService } from 'src/modules/sources/process-pdf/process-pdf.service';

@Module({
  imports: [ExtractPdfChunksModule],
  providers: [ProcessPdfService],
  exports: [ProcessPdfService],
})
export class ProcessPdfModule {}
