import { Test, TestingModule } from '@nestjs/testing';
import { LoadPdfService } from 'src/components/Pdf/LoadPdf/load-pdf.service';
import { SUPABASE_SERVICE } from 'src/infrastructure/providers/supabase.provider';
import { AgentRepository } from 'src/repositories/agent.repository';

import { LoadAgentSitesService } from '../LoadAgentSites/load-agent-sites.service';

import { GenerateAgentSourceService } from './generate-agent-source.service';

describe('GenerateAgentSourceService', () => {
  let service: GenerateAgentSourceService;

  const mockSupabaseService = {
    createVectorStore: jest.fn().mockResolvedValue(undefined),
  };

  const mockLoadPdfService = {
    execute: jest.fn().mockResolvedValue([]),
    executeFromBuffer: jest.fn().mockResolvedValue([]),
  };

  const mockAgentRepository = {
    findByIdentifier: jest.fn().mockResolvedValue(null),
    update: jest.fn().mockResolvedValue(undefined),
  };

  const mockLoadAgentSitesService = {
    execute: jest.fn().mockResolvedValue(undefined),
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
        {
          provide: AgentRepository,
          useValue: mockAgentRepository,
        },
        {
          provide: LoadAgentSitesService,
          useValue: mockLoadAgentSitesService,
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
