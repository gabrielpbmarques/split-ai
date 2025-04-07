import { Test, TestingModule } from '@nestjs/testing';
import { GetRunnableChatService } from './get-runnable-chat.service';

describe('GetRunnableChatService', () => {
  let service: GetRunnableChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GetRunnableChatService],
    }).compile();

    service = module.get<GetRunnableChatService>(GetRunnableChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
