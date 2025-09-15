import { Module } from '@nestjs/common';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { ProcessMessageDataModule } from 'src/components/ArtificialIntelligence/MessageProcessing/ProcessMessageData/process-message-data.module';
import { ExtractOcrTextService } from './extract-ocr-text.service';

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
