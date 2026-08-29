import { Module } from '@nestjs/common';
import { LoadPdfModule } from 'src/components/Pdf/LoadPdf/load-pdf.module';
import { SupabaseProviderModule } from 'src/infrastructure/providers/supabase.provider.module';

import { ProcessPdfSourceService } from './process-pdf-source.service';

@Module({
  imports: [LoadPdfModule, SupabaseProviderModule],
  providers: [ProcessPdfSourceService],
  exports: [ProcessPdfSourceService],
})
export class ProcessPdfSourceModule {}
