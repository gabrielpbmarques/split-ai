import { Module } from '@nestjs/common';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { ExtractOcrTextService } from './extract-ocr-text.service';
import { ArtificialIntelligenceModule } from 'src/components/ArtificialIntelligence/artificial-intelligence.module';

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
