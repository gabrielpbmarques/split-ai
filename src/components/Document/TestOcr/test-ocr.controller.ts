import { Body, Controller, Post } from '@nestjs/common';
import { TestOcrDto } from './test-ocr.dto';
import { TestOcrService } from './test-ocr.service';

@Controller('test-ocr')
export class TestOcrController {
  constructor(private readonly testOcrService: TestOcrService) {}

  @Post()
  async extractOcrFromUrls(@Body() testOcrDto: TestOcrDto) {
    return this.testOcrService.extractOcrFromUrls(testOcrDto);
  }
}
