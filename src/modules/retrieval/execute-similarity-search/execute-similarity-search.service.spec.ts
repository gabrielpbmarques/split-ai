import { Test, type TestingModule } from '@nestjs/testing';

import { ExecuteSimilaritySearchService } from 'src/modules/retrieval/execute-similarity-search/execute-similarity-search.service';
import { RerankDocumentsService } from 'src/modules/retrieval/rerank-documents/rerank-documents.service';

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
