import { Test, TestingModule } from '@nestjs/testing';
import { ProcessPdfService } from './process-pdf.service';
import { ExtractPdfChunksService } from '../ExtractPdfChunks/extract-pdf-chunks.service';

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
