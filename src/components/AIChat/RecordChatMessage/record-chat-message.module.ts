import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { RecordChatMessageService } from './record-chat-message.service';

@Module({
  imports: [RepositoriesModule],
  providers: [RecordChatMessageService],
  exports: [RecordChatMessageService],
})
export class RecordChatMessageModule {}
