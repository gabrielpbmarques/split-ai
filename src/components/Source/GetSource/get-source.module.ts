import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { GetSourceController } from './get-source.controller';
import { GetSourceService } from './get-source.service';

@Module({
  imports: [RepositoriesModule, AuthModule],
  controllers: [GetSourceController],
  providers: [GetSourceService],
})
export class GetSourceModule {}
