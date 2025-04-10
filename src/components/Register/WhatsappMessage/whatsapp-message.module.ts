import { Module } from '@nestjs/common';
import { WhatsappMessageController } from './whatsapp-message.controller';
import { WhatsappMessageService } from './whatsapp-message.service';
import { DatabaseModule } from '../../../database/database.module';

// Importando os módulos dos casos de uso
import { FindOrCreateSessionModule } from '../FindOrCreateSession/find-or-create-session.module';
import { ProcessMessageDataModule } from '../ProcessMessageData/process-message-data.module';
import { UpdateWorkerModule } from '../UpdateWorker/update-worker.module';
import { GenerateResponseModule } from '../GenerateResponse/generate-response.module';

// Importando o repositório de sessão
import { UpdateLastAiResponseModule } from '../UpdateLastAiResponse/update-last-ai-response.module';

@Module({
  imports: [
    DatabaseModule,
    FindOrCreateSessionModule,
    ProcessMessageDataModule,
    UpdateWorkerModule,
    GenerateResponseModule,
    UpdateLastAiResponseModule,
  ],
  providers: [WhatsappMessageService],
  controllers: [WhatsappMessageController],
  exports: [WhatsappMessageService],
})
export class WhatsappMessageModule {}
