import { Module } from '@nestjs/common';
import { WhatsappMessageModule } from './WhatsappMessage/whatsapp-message.module';
import { GenerateResponseModule } from './GenerateResponse/generate-response.module';
import { UpdateWorkerModule } from './UpdateWorker/update-worker.module';
import { SaveSessionModule } from './SaveSession/save-session.module';
import { SaveWorkerModule } from './SaveWorker/save-worker.module';
import { HandleRegisterCompletionModule } from './HandleRegisterCompletion/handle-register-completion.module';

// Importando módulos dos novos componentes
import { MessageProcessingModule } from '../MessageProcessing/message-processing.module';
import { SessionManagementModule } from '../SessionManagement/session-management.module';
import { MediaProcessingModule } from '../MediaProcessing/media-processing.module';
import { LocationServicesModule } from '../LocationServices/location-services.module';
import { UserManagementModule } from '../UserManagement/user-management.module';
import { ContactManagementModule } from '../ContactManagement/contact-management.module';
import { FinancialManagementModule } from '../FinancialManagement/financial-management.module';
import { AIIntegrationModule } from '../AIIntegration/ai-integration.module';

@Module({
  imports: [
    // Módulos internos do Register
    WhatsappMessageModule,
    GenerateResponseModule,
    UpdateWorkerModule,
    SaveSessionModule,
    SaveWorkerModule,
    HandleRegisterCompletionModule,

    // Módulos externos que foram migrados
    MessageProcessingModule,
    SessionManagementModule,
    MediaProcessingModule,
    LocationServicesModule,
    UserManagementModule,
    ContactManagementModule,
    FinancialManagementModule,
    AIIntegrationModule,
  ],
  exports: [
    // Módulos internos do Register
    WhatsappMessageModule,
    GenerateResponseModule,
    UpdateWorkerModule,
    SaveSessionModule,
    SaveWorkerModule,
    HandleRegisterCompletionModule,
  ],
})
export class RegisterModule {}
