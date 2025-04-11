import { Test, TestingModule } from '@nestjs/testing';
import { SaveWorkerService } from './save-worker.service';

describe('SaveWorkerService', () => {
  let service: SaveWorkerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SaveWorkerService],
    }).compile();

    service = module.get<SaveWorkerService>(SaveWorkerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
