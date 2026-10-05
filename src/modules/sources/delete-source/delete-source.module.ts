import { Module } from '@nestjs/common';

import { DeleteSourceController } from 'src/modules/sources/delete-source/delete-source.controller';
import { DeleteSourceService } from 'src/modules/sources/delete-source/delete-source.service';
import { SourceRepositoryModule } from 'src/modules/sources/repositories/source.repository.module';

@Module({
  imports: [SourceRepositoryModule],
  controllers: [DeleteSourceController],
  providers: [DeleteSourceService],
})
export class DeleteSourceModule {}
