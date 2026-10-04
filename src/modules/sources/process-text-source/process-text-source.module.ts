import { Module } from '@nestjs/common';

import { SupabaseProviderModule } from 'src/infrastructure/supabase/supabase.provider.module';
import { ProcessTextSourceService } from 'src/modules/sources/process-text-source/process-text-source.service';

@Module({
  imports: [SupabaseProviderModule],
  providers: [ProcessTextSourceService],
  exports: [ProcessTextSourceService],
})
export class ProcessTextSourceModule {}
