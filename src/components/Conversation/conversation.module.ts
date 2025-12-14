import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity, SessionEntity } from 'src/entities';

import { GetSessionMessagesModule } from './GetSessionMessages/get-session-messages.module';
import { ListSessionsModule } from './ListSessions/list-sessions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SessionEntity, MessageEntity]),
    ListSessionsModule,
    GetSessionMessagesModule,
  ],
  exports: [GetSessionMessagesModule], // Export module for use in Report module
})
export class ConversationModule {}
