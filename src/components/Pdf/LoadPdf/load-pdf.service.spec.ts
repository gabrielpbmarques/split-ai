import { Test, TestingModule } from '@nestjs/testing';
import { LoadPdfService } from './load-pdf.service';

describe('LoadPdfService', () => {
  let service: LoadPdfService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoadPdfService],
    }).compile();

    service = module.get<LoadPdfService>(LoadPdfService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
