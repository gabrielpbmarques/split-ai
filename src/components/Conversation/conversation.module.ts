import { Module } from '@nestjs/common';

import { GetSessionMessagesModule } from './GetSessionMessages/get-session-messages.module';
import { ListSessionsModule } from './ListSessions/list-sessions.module';

@Module({
  imports: [ListSessionsModule, GetSessionMessagesModule],
  exports: [ListSessionsModule, GetSessionMessagesModule],
})
export class ConversationModule {}
