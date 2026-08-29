import { Module } from '@nestjs/common';
import { MessageRepositoryModule } from 'src/repositories/message.repository.module';

import { RecordChatMessageService } from './record-chat-message.service';

@Module({
  imports: [MessageRepositoryModule],
  providers: [RecordChatMessageService],
  exports: [RecordChatMessageService],
})
export class RecordChatMessageModule {}
