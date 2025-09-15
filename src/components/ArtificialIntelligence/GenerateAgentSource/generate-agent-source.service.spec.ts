import { Test, TestingModule } from '@nestjs/testing';
import { LoadPdfService } from 'src/components/Pdf/LoadPdf/load-pdf.service';
import { SUPABASE_SERVICE } from 'src/infrastructure/providers/supabase.provider';

import { GenerateAgentSourceService } from './generate-agent-source.service';

describe('GenerateAgentSourceService', () => {
  let service: GenerateAgentSourceService;

  const mockSupabaseService = {
    createVectorStore: jest.fn().mockResolvedValue(undefined),
  };

  const mockLoadPdfService = {
    execute: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateAgentSourceService,
        {
          provide: SUPABASE_SERVICE,
          useValue: mockSupabaseService,
        },
        {
          provide: LoadPdfService,
          useValue: mockLoadPdfService,
        },
      ],
    }).compile();

    service = module.get<GenerateAgentSourceService>(
      GenerateAgentSourceService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
