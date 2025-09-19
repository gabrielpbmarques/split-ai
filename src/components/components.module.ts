import { Module } from '@nestjs/common';
import { SessionModule } from 'src/components/Session/session.module';

import { AIChatModule } from './AIChat/ai-chat.module';
import { ArtificialIntelligenceModule } from './ArtificialIntelligence/artificial-intelligence.module';
import { OcrModule } from './OCR/ocr.module';
import { PdfModule } from './Pdf/pdf.module';

@Module({
  imports: [
    SessionModule,
    AIChatModule,
    ArtificialIntelligenceModule,
    OcrModule,
    PdfModule,
  ],
  exports: [
    SessionModule,
    AIChatModule,
    ArtificialIntelligenceModule,
    OcrModule,
    PdfModule,
  ],
})
export class ComponentsModule {}
