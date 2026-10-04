import { Module } from '@nestjs/common';

import { SupabaseProviderModule } from 'src/infrastructure/supabase/supabase.provider.module';
import { LoadPdfModule } from 'src/modules/sources/load-pdf/load-pdf.module';
import { ProcessPdfSourceService } from 'src/modules/sources/process-pdf-source/process-pdf-source.service';

@Module({
  imports: [LoadPdfModule, SupabaseProviderModule],
  providers: [ProcessPdfSourceService],
  exports: [ProcessPdfSourceService],
})
export class ProcessPdfSourceModule {}
