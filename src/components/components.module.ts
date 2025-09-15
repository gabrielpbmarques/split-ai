import { Module } from '@nestjs/common';
import { DocumentModule } from 'src/components/Document/document.module';
import { MediaProcessingModule } from 'src/components/MediaProcessing/media-processing.module';
import { SessionModule } from 'src/components/Session/session.module';
import { SupportModule } from './Support/support.module';
import { ArtificialIntelligenceModule } from './ArtificialIntelligence/artificial-intelligence.module';

@Module({
  imports: [
    DocumentModule,
    MediaProcessingModule,
    SessionModule,
    SupportModule,
    ArtificialIntelligenceModule,
  ],
  exports: [
    DocumentModule,
    MediaProcessingModule,
    SessionModule,
    SupportModule,
    ArtificialIntelligenceModule,
  ],
})
export class ComponentsModule {}
