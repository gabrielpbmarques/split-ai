import { Module } from '@nestjs/common';
import { LangchainModule } from 'src/components/Langchain/langchain.module';
import { PromptModule } from 'src/components/Prompt/prompt.module';
import { RegisterModule } from 'src/components/Register/register.module';
import { DocumentValidationModule } from 'src/components/Document/DocumentValidation/document-validation.module';
import { MessageProcessingModule } from 'src/components/MessageProcessing/message-processing.module';
import { SessionManagementModule } from 'src/components/SessionManagement/session-management.module';
import { MediaProcessingModule } from 'src/components/MediaProcessing/media-processing.module';
import { LocationServicesModule } from 'src/components/LocationServices/location-services.module';
import { UserManagementModule } from 'src/components/UserManagement/user-management.module';
import { ContactManagementModule } from 'src/components/ContactManagement/contact-management.module';
import { FinancialManagementModule } from 'src/components/FinancialManagement/financial-management.module';
import { AIIntegrationModule } from 'src/components/AIIntegration/ai-integration.module';
import { TestOcrModule } from 'src/components/Document/TestOcr/test-ocr.module';
import { TestFaceMatchModule } from 'src/components/Document/TestFaceMatch/test-face-match.module';
import { GetjobTemplatesModule } from 'src/components/Job/GetJobTemplates/getjob-templates.module';

@Module({
  imports: [
    LangchainModule,
    PromptModule,
    RegisterModule,
    DocumentValidationModule,
    MessageProcessingModule,
    SessionManagementModule,
    MediaProcessingModule,
    LocationServicesModule,
    UserManagementModule,
    ContactManagementModule,
    FinancialManagementModule,
    AIIntegrationModule,
    TestOcrModule,
    TestFaceMatchModule,
    GetjobTemplatesModule,
  ],
  exports: [
    LangchainModule,
    PromptModule,
    RegisterModule,
    DocumentValidationModule,
    MessageProcessingModule,
    SessionManagementModule,
    MediaProcessingModule,
    LocationServicesModule,
    UserManagementModule,
    ContactManagementModule,
    FinancialManagementModule,
    AIIntegrationModule,
    TestOcrModule,
    TestFaceMatchModule,
    GetjobTemplatesModule,
  ],
})
export class ComponentsModule {}
