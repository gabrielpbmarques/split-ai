import { Module } from '@nestjs/common';
import { WhatsappMessageModule } from 'src/components/Register/WhatsappMessage/whatsapp-message.module';
import { GenerateResponseModule } from 'src/components/Register/GenerateResponse/generate-response.module';
import { UpdateWorkerModule } from 'src/components/Register/UpdateWorker/update-worker.module';
import { SaveSessionModule } from 'src/components/Register/SaveSession/save-session.module';
import { SaveWorkerModule } from 'src/components/Register/SaveWorker/save-worker.module';
import { HandleRegisterCompletionModule } from 'src/components/Register/HandleRegisterCompletion/handle-register-completion.module';

// Importando módulos dos novos componentes
import { MessageProcessingModule } from 'src/components/MessageProcessing/message-processing.module';
import { SessionManagementModule } from 'src/components/SessionManagement/session-management.module';
import { MediaProcessingModule } from 'src/components/MediaProcessing/media-processing.module';
import { LocationServicesModule } from 'src/components/LocationServices/location-services.module';
import { UserManagementModule } from 'src/components/UserManagement/user-management.module';
import { ContactManagementModule } from 'src/components/ContactManagement/contact-management.module';
import { FinancialManagementModule } from 'src/components/FinancialManagement/financial-management.module';
import { AIIntegrationModule } from 'src/components/AIIntegration/ai-integration.module';

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
