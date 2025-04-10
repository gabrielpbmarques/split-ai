import { Module } from '@nestjs/common';
import { WhatsappMessageController } from './whatsapp-message.controller';
import { WhatsappMessageService } from './whatsapp-message.service';
import { DatabaseModule } from '../../../database/database.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Session, SessionSchema } from '../../../schemas/Session.schema';

// Importando os módulos dos casos de uso
import { FindOrCreateSessionModule } from '../FindOrCreateSession/find-or-create-session.module';
import { ProcessMessageDataModule } from '../ProcessMessageData/process-message-data.module';
import { UpdateWorkerModule } from '../UpdateWorker/update-worker.module';
import { GenerateResponseModule } from '../GenerateResponse/generate-response.module';

// Importando o repositório de sessão
import { SessionRepository } from '../../../repositories/Session.repository';

@Module({
  imports: [
    DatabaseModule,
    // Importando o modelo de sessão do Mongoose
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
    // Importando os módulos dos casos de uso
    FindOrCreateSessionModule,
    ProcessMessageDataModule,
    UpdateWorkerModule,
    GenerateResponseModule,
  ],
  providers: [WhatsappMessageService, SessionRepository],
  controllers: [WhatsappMessageController],
  exports: [WhatsappMessageService],
})
export class WhatsappMessageModule {}
