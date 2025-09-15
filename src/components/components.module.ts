import { Module } from '@nestjs/common';
import { DocumentModule } from 'src/components/Document/document.module';
import { MediaProcessingModule } from 'src/components/MediaProcessing/media-processing.module';
import { TestOcrModule } from 'src/components/Document/TestOcr/test-ocr.module';
import { TestFaceMatchModule } from 'src/components/Document/TestFaceMatch/test-face-match.module';

@Module({
  imports: [
    DocumentModule,
    MediaProcessingModule,
    TestOcrModule,
    TestFaceMatchModule,
  ],
  exports: [
    DocumentModule,
    MediaProcessingModule,
    TestOcrModule,
    TestFaceMatchModule,
  ],
})
export class ComponentsModule {}
