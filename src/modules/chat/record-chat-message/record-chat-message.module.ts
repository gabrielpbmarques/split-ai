import { Module } from '@nestjs/common';

import { RecordChatMessageService } from 'src/modules/chat/record-chat-message/record-chat-message.service';
import { MessageRepositoryModule } from 'src/modules/sessions/repositories/message.repository.module';

@Module({
  imports: [MessageRepositoryModule],
  providers: [RecordChatMessageService],
  exports: [RecordChatMessageService],
})
export class RecordChatMessageModule {}
