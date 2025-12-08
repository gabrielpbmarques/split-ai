import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { ListSourcesController } from './list-sources.controller';
import { ListSourcesService } from './list-sources.service';

@Module({
  imports: [RepositoriesModule, AuthModule],
  controllers: [ListSourcesController],
  providers: [ListSourcesService],
})
export class ListSourcesModule {}
