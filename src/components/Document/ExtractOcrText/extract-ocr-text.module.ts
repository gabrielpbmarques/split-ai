import { Module } from '@nestjs/common';
import { ExtractOcrTextService } from 'src/components/Document/ExtractOcrText/extract-ocr-text.service';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { ProcessMessageDataModule } from 'src/components/MessageProcessing/ProcessMessageData/process-message-data.module';

@Module({
  imports: [ProcessMessageDataModule],
  providers: [
    ExtractOcrTextService,
    {
      provide: ImageAnnotatorClient,
      useFactory: () => new ImageAnnotatorClient(),
    },
  ],
  exports: [ExtractOcrTextService],
})
export class ExtractOcrTextModule {}
