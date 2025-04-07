import { Test, TestingModule } from '@nestjs/testing';
import { LoadVectorStoreService } from './load-vector-store.service';

describe('LoadVectorStoreService', () => {
  let service: LoadVectorStoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoadVectorStoreService],
    }).compile();

    service = module.get<LoadVectorStoreService>(LoadVectorStoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
