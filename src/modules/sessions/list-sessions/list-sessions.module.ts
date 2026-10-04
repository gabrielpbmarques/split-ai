import { Module } from '@nestjs/common';

import { ListSessionsController } from 'src/modules/sessions/list-sessions/list-sessions.controller';
import { ListSessionsService } from 'src/modules/sessions/list-sessions/list-sessions.service';
import { SessionRepositoryModule } from 'src/modules/sessions/repositories/session.repository.module';

@Module({
  imports: [SessionRepositoryModule],
  controllers: [ListSessionsController],
  providers: [ListSessionsService],
  exports: [ListSessionsService],
})
export class ListSessionsModule {}
