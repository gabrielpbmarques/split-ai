import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { DeleteSourceController } from './delete-source.controller';
import { DeleteSourceService } from './delete-source.service';

@Module({
  imports: [RepositoriesModule, AuthModule, InfrastructureModule],
  controllers: [DeleteSourceController],
  providers: [DeleteSourceService],
})
export class DeleteSourceModule {}
