import { Module } from '@nestjs/common';

import { SupabaseProviderModule } from 'src/infrastructure/supabase/supabase.provider.module';
import { DeleteSourceController } from 'src/modules/sources/delete-source/delete-source.controller';
import { DeleteSourceService } from 'src/modules/sources/delete-source/delete-source.service';
import { SourceRepositoryModule } from 'src/modules/sources/repositories/source.repository.module';

@Module({
  imports: [SourceRepositoryModule, SupabaseProviderModule],
  controllers: [DeleteSourceController],
  providers: [DeleteSourceService],
})
export class DeleteSourceModule {}
