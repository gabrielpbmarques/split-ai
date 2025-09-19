import { Module } from '@nestjs/common';

import { ProcessPdfModule } from '../ProcessPdf/process-pdf.module';

import { LoadPdfService } from './load-pdf.service';

@Module({
  imports: [ProcessPdfModule],
  providers: [LoadPdfService],
  exports: [LoadPdfService],
})
export class LoadPdfModule {}
