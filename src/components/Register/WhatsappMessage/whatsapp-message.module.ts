import { Module } from '@nestjs/common';
import { WhatsappMessageController } from 'src/components/Register/WhatsappMessage/whatsapp-message.controller';
import { WhatsappMessageService } from 'src/components/Register/WhatsappMessage/whatsapp-message.service';
import { RepositoriesModule } from 'src/repositories/repositories.module';
// Imports dos módulos migrados
import { FindOrCreateSessionModule } from 'src/components/SessionManagement/FindOrCreateSession/find-or-create-session.module';
import { ProcessMessageDataModule } from 'src/components/MessageProcessing/ProcessMessageData/process-message-data.module';
import { UpdateWorkerModule } from 'src/components/Register/UpdateWorker/update-worker.module';
import { GenerateResponseModule } from 'src/components/Register/GenerateResponse/generate-response.module';
import { ProcessImageMessageModule } from 'src/components/MediaProcessing/ProcessImageMessage/process-image-message.module';
import { UpdateDocumentModule } from 'src/components/MediaProcessing/UpdateDocument/update-document.module';
import { UpdateLastAiResponseModule } from 'src/components/SessionManagement/UpdateLastAiResponse/update-last-ai-response.module';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { HandleRegisterCompletionModule } from 'src/components/Register/HandleRegisterCompletion/handle-register-completion.module';

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
    InfrastructureModule,
    HandleRegisterCompletionModule,
  ],
  providers: [WhatsappMessageService],
  controllers: [WhatsappMessageController],
  exports: [WhatsappMessageService],
})
export class WhatsappMessageModule {}
