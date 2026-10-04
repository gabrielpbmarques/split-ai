import { Module } from '@nestjs/common';

import { AuthModule } from 'src/auth/auth.module';
import { GetSourceController } from 'src/modules/sources/get-source/get-source.controller';
import { GetSourceService } from 'src/modules/sources/get-source/get-source.service';
import { SourceRepositoryModule } from 'src/modules/sources/repositories/source.repository.module';

@Module({
  imports: [AuthModule, SourceRepositoryModule],
  controllers: [GetSourceController],
  providers: [GetSourceService],
})
export class GetSourceModule {}
