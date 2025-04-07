import { Test, TestingModule } from '@nestjs/testing';
import { ExecuteSimilaritySearchService } from './execute-similarity-search.service';

describe('ExecuteSimilaritySearchService', () => {
  let service: ExecuteSimilaritySearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExecuteSimilaritySearchService],
    }).compile();

    service = module.get<ExecuteSimilaritySearchService>(
      ExecuteSimilaritySearchService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
