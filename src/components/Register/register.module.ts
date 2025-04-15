import { Module } from '@nestjs/common';
import { GenerateAiResponseModule } from './Common/generate-ai-response.module';
import { WhatsappMessageModule } from './WhatsappMessage/whatsapp-message.module';
import { ProcessImageMessageModule } from './ProcessImageMessage/process-image-message.module';
import { UpdateDocumentModule } from './UpdateDocument/update-document.module';

@Module({
  imports: [
    GenerateAiResponseModule,
    WhatsappMessageModule,
    ProcessImageMessageModule,
    UpdateDocumentModule,
  ],
  exports: [
    GenerateAiResponseModule,
    WhatsappMessageModule,
    ProcessImageMessageModule,
    UpdateDocumentModule,
  ],
})
export class RegisterModule {}
