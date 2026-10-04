import { Module } from '@nestjs/common';

import { AttendantModule } from 'src/modules/chat/attendant/attendant.module';
import { QuestionModule } from 'src/modules/chat/question/question.module';
import { RecordChatMessageModule } from 'src/modules/chat/record-chat-message/record-chat-message.module';

@Module({
  imports: [AttendantModule, QuestionModule, RecordChatMessageModule],
  exports: [AttendantModule, QuestionModule, RecordChatMessageModule],
})
export class ChatModule {}
