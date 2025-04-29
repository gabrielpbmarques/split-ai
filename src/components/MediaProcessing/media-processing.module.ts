import { Module } from '@nestjs/common';
import { ProcessImageMessageModule } from 'src/components/MediaProcessing/ProcessImageMessage/process-image-message.module';
import { UpdateDocumentModule } from 'src/components/MediaProcessing/UpdateDocument/update-document.module';

@Module({
  imports: [ProcessImageMessageModule, UpdateDocumentModule],
  exports: [ProcessImageMessageModule, UpdateDocumentModule],
})
export class MediaProcessingModule {}
