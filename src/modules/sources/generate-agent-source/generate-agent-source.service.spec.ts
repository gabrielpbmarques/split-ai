import { Test, TestingModule } from '@nestjs/testing';

import { LoadAgentSitesService } from 'src/modules/agents/load-agent-sites/load-agent-sites.service';
import { AgentRepository } from 'src/modules/agents/repositories/agent.repository';
import { GenerateAgentSourceService } from 'src/modules/sources/generate-agent-source/generate-agent-source.service';
import { ProcessDocxSourceService } from 'src/modules/sources/process-docx-source/process-docx-source.service';
import { ProcessPdfSourceService } from 'src/modules/sources/process-pdf-source/process-pdf-source.service';
import { ProcessTextSourceService } from 'src/modules/sources/process-text-source/process-text-source.service';
import { SourceRepository } from 'src/modules/sources/repositories/source.repository';
import { ResolveSourceAgentService } from 'src/modules/sources/resolve-source-agent/resolve-source-agent.service';

describe('GenerateAgentSourceService', () => {
  let service: GenerateAgentSourceService;

  const resolveSourceAgentService = {
    execute: jest
      .fn()
      .mockResolvedValue({ agentId: 'agent-1', organizationId: null }),
  };
  const processPdfSourceService = { execute: jest.fn().mockResolvedValue(3) };
  const processTextSourceService = { execute: jest.fn().mockResolvedValue(2) };
  const processDocxSourceService = { execute: jest.fn().mockResolvedValue(4) };
  const loadAgentSitesService = { execute: jest.fn().mockResolvedValue(5) };
  const agentRepository = { update: jest.fn().mockResolvedValue(undefined) };
  const sourceRepository = {
    create: jest
      .fn()
      .mockImplementation((data) =>
        Promise.resolve({ id: 'source-1', ...data }),
      ),
    updateChunkCount: jest.fn().mockResolvedValue(undefined),
    updateStatus: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateAgentSourceService,
        {
          provide: ResolveSourceAgentService,
          useValue: resolveSourceAgentService,
        },
        { provide: ProcessPdfSourceService, useValue: processPdfSourceService },
        {
          provide: ProcessTextSourceService,
          useValue: processTextSourceService,
        },
        {
          provide: ProcessDocxSourceService,
          useValue: processDocxSourceService,
        },
        { provide: LoadAgentSitesService, useValue: loadAgentSitesService },
        { provide: AgentRepository, useValue: agentRepository },
        { provide: SourceRepository, useValue: sourceRepository },
      ],
    }).compile();

    service = module.get<GenerateAgentSourceService>(
      GenerateAgentSourceService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a site source, indexes it, and updates the agent sites', async () => {
    const result = await service.execute({
      url: 'https://www.example.com',
    } as any);

    expect(resolveSourceAgentService.execute).toHaveBeenCalledWith(undefined);
    expect(sourceRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        agent_id: 'agent-1',
        source_type: 'site',
        url: 'https://www.example.com',
        name: 'example.com',
        status: 'processing',
      }),
    );
    expect(loadAgentSitesService.execute).toHaveBeenCalledWith(
      'https://www.example.com',
      'agent-1',
      'source-1',
    );
    expect(sourceRepository.updateChunkCount).toHaveBeenCalledWith(
      'source-1',
      5,
    );
    expect(sourceRepository.updateStatus).toHaveBeenCalledWith(
      'source-1',
      'completed',
    );
    expect(agentRepository.update).toHaveBeenCalledWith('agent-1', {
      sites: ['https://www.example.com'],
    });
    expect(result).toHaveLength(1);
  });

  it('routes a pdf upload to the pdf processor', async () => {
    await service.execute({
      buffer: Buffer.from('%PDF-1.4'),
      mimeType: 'application/pdf',
      fileName: 'doc.pdf',
    } as any);

    expect(processPdfSourceService.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        agentId: 'agent-1',
        organizationId: null,
        sourceId: 'source-1',
      }),
    );
    expect(processTextSourceService.execute).not.toHaveBeenCalled();
    expect(sourceRepository.updateStatus).toHaveBeenCalledWith(
      'source-1',
      'completed',
    );
  });

  it('routes a docx upload by extension when the mime type is missing', async () => {
    await service.execute({
      buffer: Buffer.from('PK'),
      fileName: 'contract.docx',
    } as any);

    expect(processDocxSourceService.execute).toHaveBeenCalled();
  });

  it('rejects an unsupported file type before creating a source', async () => {
    await expect(
      service.execute({
        buffer: Buffer.from('...'),
        mimeType: 'image/png',
        fileName: 'photo.png',
      } as any),
    ).rejects.toThrow('Tipo de arquivo não suportado');

    expect(sourceRepository.create).not.toHaveBeenCalled();
  });

  it('marks the source failed when a processor throws', async () => {
    processPdfSourceService.execute.mockRejectedValueOnce(new Error('boom'));

    await service.execute({
      buffer: Buffer.from('%PDF'),
      mimeType: 'application/pdf',
    } as any);

    expect(sourceRepository.updateStatus).toHaveBeenCalledWith(
      'source-1',
      'failed',
      'boom',
    );
  });
});
