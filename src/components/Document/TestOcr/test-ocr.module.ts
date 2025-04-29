import { Module } from '@nestjs/common';
import { TestOcrController } from './test-ocr.controller';
import { TestOcrService } from './test-ocr.service';
import { ExtractOcrTextModule } from '../ExtractOcrText/extract-ocr-text.module';

@Module({
  imports: [ExtractOcrTextModule],
  controllers: [TestOcrController],
  providers: [TestOcrService],
})
export class TestOcrModule {}
