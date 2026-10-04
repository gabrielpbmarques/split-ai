import { Module } from '@nestjs/common';

import { SupabaseProviderModule } from 'src/infrastructure/supabase/supabase.provider.module';
import { ProcessDocxSourceService } from 'src/modules/sources/process-docx-source/process-docx-source.service';

@Module({
  imports: [SupabaseProviderModule],
  providers: [ProcessDocxSourceService],
  exports: [ProcessDocxSourceService],
})
export class ProcessDocxSourceModule {}
