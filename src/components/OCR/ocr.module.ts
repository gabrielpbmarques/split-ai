import { Module } from '@nestjs/common';
import { ExtractOcrTextModule } from './ExtractOcrText/extract-ocr-text.module';

@Module({
  imports: [ExtractOcrTextModule],
  exports: [ExtractOcrTextModule],
})
export class OcrModule {}
