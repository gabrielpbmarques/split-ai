import { Module } from '@nestjs/common';
import { DocumentValidationService } from 'src/components/Document/DocumentValidation/document-validation.service';
import { RepositoriesModule } from 'src/repositories/repositories.module';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { DocumentValidationController } from 'src/components/Document/DocumentValidation/document-validation.controller';
import { ExtractOcrTextModule } from 'src/components/Document/ExtractOcrText/extract-ocr-text.module';

@Module({
  imports: [InfrastructureModule, RepositoriesModule, ExtractOcrTextModule],
  providers: [DocumentValidationService],
  exports: [DocumentValidationService],
  controllers: [DocumentValidationController],
})
export class DocumentValidationModule {}
