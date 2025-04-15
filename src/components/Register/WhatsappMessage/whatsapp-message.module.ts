import { Module } from '@nestjs/common';
import { WhatsappMessageController } from './whatsapp-message.controller';
import { WhatsappMessageService } from './whatsapp-message.service';
import { WhatsappTestController } from './whatsapp-test.controller';
import { RepositoriesModule } from 'src/repositories/repositories.module';
import { FindOrCreateSessionModule } from '../FindOrCreateSession/find-or-create-session.module';
import { ProcessMessageDataModule } from '../ProcessMessageData/process-message-data.module';
import { UpdateWorkerModule } from '../UpdateWorker/update-worker.module';
import { GenerateResponseModule } from '../GenerateResponse/generate-response.module';
import { ProcessImageMessageModule } from '../ProcessImageMessage/process-image-message.module';
import { UpdateDocumentModule } from '../UpdateDocument/update-document.module';
import { UpdateLastAiResponseModule } from '../UpdateLastAiResponse/update-last-ai-response.module';

@Module({
  imports: [
    RepositoriesModule,
    FindOrCreateSessionModule,
    ProcessMessageDataModule,
    UpdateWorkerModule,
    GenerateResponseModule,
    UpdateLastAiResponseModule,
    ProcessImageMessageModule,
    UpdateDocumentModule,
  ],
  providers: [WhatsappMessageService],
  controllers: [WhatsappMessageController, WhatsappTestController],
  exports: [WhatsappMessageService],
})
export class WhatsappMessageModule {}
