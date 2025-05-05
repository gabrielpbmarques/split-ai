import { Test, TestingModule } from '@nestjs/testing';
import { ProcessPdfService } from './process-pdf.service';

describe('ProcessPdfService', () => {
  let service: ProcessPdfService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProcessPdfService],
    }).compile();

    service = module.get<ProcessPdfService>(ProcessPdfService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
