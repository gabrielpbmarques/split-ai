import { Module } from '@nestjs/common';
import { WhatsappMessageController } from './whatsapp-message.controller';
import { WhatsappMessageService } from './whatsapp-message.service';
import { RepositoriesModule } from 'src/repositories/repositories.module';
// Imports dos módulos migrados
import { FindOrCreateSessionModule } from '../../SessionManagement/FindOrCreateSession/find-or-create-session.module';
import { ProcessMessageDataModule } from '../../MessageProcessing/ProcessMessageData/process-message-data.module';
import { UpdateWorkerModule } from '../UpdateWorker/update-worker.module';
import { GenerateResponseModule } from '../GenerateResponse/generate-response.module';
import { ProcessImageMessageModule } from '../../MediaProcessing/ProcessImageMessage/process-image-message.module';
import { UpdateDocumentModule } from '../../MediaProcessing/UpdateDocument/update-document.module';
import { UpdateLastAiResponseModule } from '../../SessionManagement/UpdateLastAiResponse/update-last-ai-response.module';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { HandleRegisterCompletionModule } from '../HandleRegisterCompletion/handle-register-completion.module';

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
