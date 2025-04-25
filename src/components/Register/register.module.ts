import { Module } from '@nestjs/common';
import { GenerateAiResponseModule } from './Common/generate-ai-response.module';
import { WhatsappMessageModule } from './WhatsappMessage/whatsapp-message.module';
import { ProcessImageMessageModule } from './ProcessImageMessage/process-image-message.module';
import { UpdateDocumentModule } from './UpdateDocument/update-document.module';
import { CepLookupModule } from './CepLookup/cep-lookup.module';

@Module({
  imports: [
    GenerateAiResponseModule,
    WhatsappMessageModule,
    ProcessImageMessageModule,
    UpdateDocumentModule,
    CepLookupModule,
  ],
  exports: [
    GenerateAiResponseModule,
    WhatsappMessageModule,
    ProcessImageMessageModule,
    UpdateDocumentModule,
    CepLookupModule,
  ],
})
export class RegisterModule {}
