import { Module } from '@nestjs/common';
import { ProcessImageMessageModule } from './ProcessImageMessage/process-image-message.module';
import { UpdateDocumentModule } from './UpdateDocument/update-document.module';

@Module({
  imports: [ProcessImageMessageModule, UpdateDocumentModule],
  exports: [ProcessImageMessageModule, UpdateDocumentModule],
})
export class MediaProcessingModule {}
