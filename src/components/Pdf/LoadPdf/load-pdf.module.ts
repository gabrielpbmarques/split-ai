import { Module } from '@nestjs/common';
import { LoadPdfService } from './load-pdf.service';
import { ProcessPdfModule } from '../ProcessPdf/process-pdf.module';

@Module({
  imports: [ProcessPdfModule],
  providers: [LoadPdfService],
  exports: [LoadPdfService],
})
export class LoadPdfModule {}
