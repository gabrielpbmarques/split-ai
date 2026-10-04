import { Module } from '@nestjs/common';

import { VoyageEmbeddingsProviderModule } from 'src/infrastructure/voyage-embeddings/voyage-embeddings.provider.module';
import { RecordChatMessageService } from 'src/modules/chat/record-chat-message/record-chat-message.service';
import { MessageRepositoryModule } from 'src/modules/sessions/repositories/message.repository.module';

@Module({
  imports: [VoyageEmbeddingsProviderModule, MessageRepositoryModule],
  providers: [RecordChatMessageService],
  exports: [RecordChatMessageService],
})
export class RecordChatMessageModule {}
