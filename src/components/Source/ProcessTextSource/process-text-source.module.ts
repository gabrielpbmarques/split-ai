import { Module } from '@nestjs/common';
import { SupabaseProviderModule } from 'src/infrastructure/providers/supabase.provider.module';

import { ProcessTextSourceService } from './process-text-source.service';

@Module({
  imports: [SupabaseProviderModule],
  providers: [ProcessTextSourceService],
  exports: [ProcessTextSourceService],
})
export class ProcessTextSourceModule {}
