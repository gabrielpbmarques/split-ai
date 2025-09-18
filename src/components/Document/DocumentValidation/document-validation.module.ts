import { Module } from '@nestjs/common';
import { DocumentValidationService } from 'src/components/Document/DocumentValidation/document-validation.service';
import { RepositoriesModule } from 'src/repositories/repositories.module';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { DocumentValidationController } from 'src/components/Document/DocumentValidation/document-validation.controller';
import { OcrModule } from 'src/components/OCR/ocr.module';
import { ComputerVisionModule } from 'src/components/ComputerVision/computer-vision.module';

@Module({
  imports: [
    InfrastructureModule,
    RepositoriesModule,
    OcrModule,
    ComputerVisionModule,
  ],
  providers: [DocumentValidationService],
  exports: [DocumentValidationService],
  controllers: [DocumentValidationController],
})
export class DocumentValidationModule {}
