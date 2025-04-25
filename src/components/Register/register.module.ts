import { Module } from '@nestjs/common';
import { GenerateAiResponseModule } from './Common/generate-ai-response.module';
import { WhatsappMessageModule } from './WhatsappMessage/whatsapp-message.module';
import { ProcessImageMessageModule } from './ProcessImageMessage/process-image-message.module';
import { UpdateDocumentModule } from './UpdateDocument/update-document.module';
import { CepLookupModule } from './CepLookup/cep-lookup.module';
import { HandleRegisterCompletionModule } from './HandleRegisterCompletion/handle-register-completion.module';
import { UpdatePixModule } from './UpdatePix/update-pix.module';

@Module({
  imports: [
    GenerateAiResponseModule,
    WhatsappMessageModule,
    ProcessImageMessageModule,
    UpdateDocumentModule,
    CepLookupModule,
    HandleRegisterCompletionModule,
    UpdatePixModule,
  ],
  exports: [
    GenerateAiResponseModule,
    WhatsappMessageModule,
    ProcessImageMessageModule,
    UpdateDocumentModule,
    CepLookupModule,
    HandleRegisterCompletionModule,
    UpdatePixModule,
  ],
})
export class RegisterModule {}
