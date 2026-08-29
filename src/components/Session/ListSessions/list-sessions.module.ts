import { Module } from '@nestjs/common';
import { SessionRepositoryModule } from 'src/repositories/session.repository.module';

import { ListSessionsController } from './list-sessions.controller';
import { ListSessionsService } from './list-sessions.service';

@Module({
  imports: [SessionRepositoryModule],
  controllers: [ListSessionsController],
  providers: [ListSessionsService],
  exports: [ListSessionsService],
})
export class ListSessionsModule {}
