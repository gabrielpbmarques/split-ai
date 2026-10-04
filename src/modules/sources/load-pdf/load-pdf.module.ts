import { Module } from '@nestjs/common';

import { LoadPdfService } from 'src/modules/sources/load-pdf/load-pdf.service';
import { ProcessPdfModule } from 'src/modules/sources/process-pdf/process-pdf.module';

@Module({
  imports: [ProcessPdfModule],
  providers: [LoadPdfService],
  exports: [LoadPdfService],
})
export class LoadPdfModule {}
