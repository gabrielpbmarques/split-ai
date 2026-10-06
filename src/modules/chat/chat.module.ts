import { Module } from '@nestjs/common';

import { QuestionModule } from 'src/modules/chat/question/question.module';
import { RecordChatMessageModule } from 'src/modules/chat/record-chat-message/record-chat-message.module';

@Module({
  imports: [QuestionModule, RecordChatMessageModule],
  exports: [QuestionModule, RecordChatMessageModule],
})
export class ChatModule {}
