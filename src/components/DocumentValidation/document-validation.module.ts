import { Module } from '@nestjs/common';
import { DocumentValidationService } from 'src/components/DocumentValidation/document-validation.service';
import { RepositoriesModule } from 'src/repositories/repositories.module';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';

@Module({
  imports: [InfrastructureModule, RepositoriesModule],
  providers: [DocumentValidationService],
  exports: [DocumentValidationService],
})
export class DocumentValidationModule {}
