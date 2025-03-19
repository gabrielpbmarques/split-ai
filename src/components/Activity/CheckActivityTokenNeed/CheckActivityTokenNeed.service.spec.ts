import { Test, TestingModule } from '@nestjs/testing';
import { CheckActivityTokenNeedService } from './CheckActivityTokenNeed.service';

describe('CheckActivityTokenNeedService', () => {
  let service: CheckActivityTokenNeedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CheckActivityTokenNeedService],
    }).compile();

    service = module.get<CheckActivityTokenNeedService>(
      CheckActivityTokenNeedService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
