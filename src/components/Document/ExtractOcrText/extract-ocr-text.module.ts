import { Module } from '@nestjs/common';
import { ExtractOcrTextService } from './extract-ocr-text.service';
import { ImageAnnotatorClient } from '@google-cloud/vision';

@Module({
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
