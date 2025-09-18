import { Module } from '@nestjs/common';
import { DocumentModule } from 'src/components/Document/document.module';
import { MediaProcessingModule } from 'src/components/MediaProcessing/media-processing.module';
import { SessionModule } from 'src/components/Session/session.module';
import { AIChatModule } from './AIChat/ai-chat.module';
import { ArtificialIntelligenceModule } from './ArtificialIntelligence/artificial-intelligence.module';
import { OcrModule } from './OCR/ocr.module';
import { ComputerVisionModule } from './ComputerVision/computer-vision.module';
import { PdfModule } from './Pdf/pdf.module';

@Module({
  imports: [
    DocumentModule,
    MediaProcessingModule,
    SessionModule,
    AIChatModule,
    ArtificialIntelligenceModule,
    OcrModule,
    ComputerVisionModule,
    PdfModule,
  ],
  exports: [
    DocumentModule,
    MediaProcessingModule,
    SessionModule,
    AIChatModule,
    ArtificialIntelligenceModule,
    OcrModule,
    ComputerVisionModule,
    PdfModule,
  ],
})
export class ComponentsModule {}
