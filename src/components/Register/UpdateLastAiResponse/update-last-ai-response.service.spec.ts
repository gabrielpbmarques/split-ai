import { Test, TestingModule } from '@nestjs/testing';
import { UpdateLastAiResponseService } from './update-last-ai-response.service';

describe('UpdateLastAiResponseService', () => {
  let service: UpdateLastAiResponseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UpdateLastAiResponseService],
    }).compile();

    service = module.get<UpdateLastAiResponseService>(
      UpdateLastAiResponseService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
