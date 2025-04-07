import { Test, TestingModule } from '@nestjs/testing';
import { LoadAiChatService } from './load-ai-chat.service';

describe('LoadAiChatService', () => {
  let service: LoadAiChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoadAiChatService],
    }).compile();

    service = module.get<LoadAiChatService>(LoadAiChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
