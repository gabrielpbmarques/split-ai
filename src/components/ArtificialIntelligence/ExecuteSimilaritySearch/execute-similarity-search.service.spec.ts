import { Test, TestingModule } from '@nestjs/testing';

import { ExecuteSimilaritySearchService } from './execute-similarity-search.service';

describe('ExecuteSimilaritySearchService', () => {
  let service: ExecuteSimilaritySearchService;

  const mockVertexAiEmbeddings = {
    embedQuery: jest.fn().mockResolvedValue([]),
    embedDocuments: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExecuteSimilaritySearchService,
        { provide: 'VERTEX_AI_EMBEDDINGS', useValue: mockVertexAiEmbeddings },
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
