import { ImageAnnotatorClient } from '@google-cloud/vision';
import { Module } from '@nestjs/common';
import { GenerateAiResponseModule } from 'src/components/ArtificialIntelligence/GenerateAIResponse/generate-ai-response.module';
import { ResolveAgentModule } from 'src/components/ArtificialIntelligence/ResolveAgent/resolve-agent.module';

import { ExtractOcrTextService } from './extract-ocr-text.service';

@Module({
  imports: [GenerateAiResponseModule, ResolveAgentModule],
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
