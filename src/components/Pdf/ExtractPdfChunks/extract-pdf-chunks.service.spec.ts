import { Test, TestingModule } from '@nestjs/testing';
import { ExtractPdfChunksService } from './extract-pdf-chunks.service';

describe('ExtractPdfChunksService', () => {
  let service: ExtractPdfChunksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExtractPdfChunksService],
    }).compile();

    service = module.get<ExtractPdfChunksService>(ExtractPdfChunksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
