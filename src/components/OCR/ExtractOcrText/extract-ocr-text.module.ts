import { ImageAnnotatorClient } from '@google-cloud/vision';
import { Module } from '@nestjs/common';
import { ArtificialIntelligenceModule } from 'src/components/ArtificialIntelligence/artificial-intelligence.module';

import { ExtractOcrTextService } from './extract-ocr-text.service';

@Module({
  imports: [ArtificialIntelligenceModule],
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
