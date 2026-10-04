import { Module } from '@nestjs/common';

import { GetSourceController } from 'src/modules/sources/get-source/get-source.controller';
import { GetSourceService } from 'src/modules/sources/get-source/get-source.service';
import { SourceRepositoryModule } from 'src/modules/sources/repositories/source.repository.module';

@Module({
  imports: [SourceRepositoryModule],
  controllers: [GetSourceController],
  providers: [GetSourceService],
})
export class GetSourceModule {}
