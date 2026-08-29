import { Module } from '@nestjs/common';

import { CreateSessionIfNotExistsModule } from './CreateSessionIfNotExists/create-session-if-not-exists.module';
import { GetSessionMessagesModule } from './GetSessionMessages/get-session-messages.module';
import { ListSessionsModule } from './ListSessions/list-sessions.module';

@Module({
  imports: [
    CreateSessionIfNotExistsModule,
    ListSessionsModule,
    GetSessionMessagesModule,
  ],
})
export class SessionModule {}
