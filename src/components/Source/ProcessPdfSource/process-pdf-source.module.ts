import { Module } from '@nestjs/common';
import { PdfModule } from 'src/components/Pdf/pdf.module';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';

import { ProcessPdfSourceService } from './process-pdf-source.service';

@Module({
  imports: [PdfModule, InfrastructureModule],
  providers: [ProcessPdfSourceService],
  exports: [ProcessPdfSourceService],
})
export class ProcessPdfSourceModule {}
