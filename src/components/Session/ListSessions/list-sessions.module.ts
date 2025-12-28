import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { ListSessionsController } from './list-sessions.controller';
import { ListSessionsService } from './list-sessions.service';

@Module({
  imports: [RepositoriesModule],
  controllers: [ListSessionsController],
  providers: [ListSessionsService],
  exports: [ListSessionsService],
})
export class ListSessionsModule {}
