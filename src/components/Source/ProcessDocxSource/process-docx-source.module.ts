import { Module } from '@nestjs/common';
import { SupabaseProviderModule } from 'src/infrastructure/providers/supabase.provider.module';

import { ProcessDocxSourceService } from './process-docx-source.service';

@Module({
  imports: [SupabaseProviderModule],
  providers: [ProcessDocxSourceService],
  exports: [ProcessDocxSourceService],
})
export class ProcessDocxSourceModule {}
