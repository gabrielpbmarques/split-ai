import { Module } from '@nestjs/common';

import { ExtractDocumentDataController } from './extract-document-data.controller';
import { ExtractDocumentDataService } from './extract-document-data.service';

@Module({
  providers: [ExtractDocumentDataService],
  controllers: [ExtractDocumentDataController],
})
export class ExtractDocumentDataModule {}
