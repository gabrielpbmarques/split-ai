import { Module } from '@nestjs/common';

import { CreateSessionIfNotExistsModule } from 'src/modules/sessions/create-session-if-not-exists/create-session-if-not-exists.module';
import { GetSessionMessagesModule } from 'src/modules/sessions/get-session-messages/get-session-messages.module';
import { ListSessionsModule } from 'src/modules/sessions/list-sessions/list-sessions.module';

@Module({
  imports: [
    CreateSessionIfNotExistsModule,
    GetSessionMessagesModule,
    ListSessionsModule,
  ],
  exports: [
    CreateSessionIfNotExistsModule,
    GetSessionMessagesModule,
    ListSessionsModule,
  ],
})
export class SessionsModule {}
