import { Module } from '@nestjs/common';
import { SupabaseProviderModule } from 'src/infrastructure/providers/supabase.provider.module';
import { SourceRepositoryModule } from 'src/repositories/source.repository.module';

import { DeleteSourceController } from './delete-source.controller';
import { DeleteSourceService } from './delete-source.service';

@Module({
  imports: [SourceRepositoryModule, SupabaseProviderModule],
  controllers: [DeleteSourceController],
  providers: [DeleteSourceService],
})
export class DeleteSourceModule {}
