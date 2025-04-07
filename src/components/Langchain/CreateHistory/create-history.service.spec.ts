import { Test, TestingModule } from '@nestjs/testing';
import { CreateHistoryService } from './create-history.service';

describe('CreateHistoryService', () => {
  let service: CreateHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreateHistoryService],
    }).compile();

    service = module.get<CreateHistoryService>(CreateHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
