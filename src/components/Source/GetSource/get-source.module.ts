import { Module } from '@nestjs/common';
import { SourceRepositoryModule } from 'src/repositories/source.repository.module';

import { GetSourceController } from './get-source.controller';
import { GetSourceService } from './get-source.service';

@Module({
  imports: [SourceRepositoryModule],
  controllers: [GetSourceController],
  providers: [GetSourceService],
})
export class GetSourceModule {}
