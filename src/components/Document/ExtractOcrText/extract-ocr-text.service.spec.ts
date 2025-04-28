import { Test, TestingModule } from '@nestjs/testing';
import { ExtractOcrTextService } from './extract-ocr-text.service';

describe('ExtractOcrTextService', () => {
  let service: ExtractOcrTextService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExtractOcrTextService],
    }).compile();

    service = module.get<ExtractOcrTextService>(ExtractOcrTextService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
