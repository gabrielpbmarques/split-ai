import { Test, TestingModule } from '@nestjs/testing';

import { RerankDocumentsService } from '../RerankDocuments/rerank-documents.service';

import { ExecuteSimilaritySearchService } from './execute-similarity-search.service';

describe('ExecuteSimilaritySearchService', () => {
  let service: ExecuteSimilaritySearchService;

  const mockRerankDocumentsService = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExecuteSimilaritySearchService,
        {
          provide: RerankDocumentsService,
          useValue: mockRerankDocumentsService,
        },
      ],
    }).compile();

    service = module.get<ExecuteSimilaritySearchService>(
      ExecuteSimilaritySearchService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
