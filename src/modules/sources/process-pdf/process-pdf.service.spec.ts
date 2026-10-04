import { Test, TestingModule } from '@nestjs/testing';

import { ExtractPdfChunksService } from 'src/modules/sources/extract-pdf-chunks/extract-pdf-chunks.service';
import { ProcessPdfService } from 'src/modules/sources/process-pdf/process-pdf.service';

describe('ProcessPdfService', () => {
  let service: ProcessPdfService;

  const mockExtractPdfChunksService = {
    execute: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessPdfService,
        {
          provide: ExtractPdfChunksService,
          useValue: mockExtractPdfChunksService,
        },
      ],
    }).compile();

    service = module.get<ProcessPdfService>(ProcessPdfService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
