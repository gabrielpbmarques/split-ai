import { Test, TestingModule } from '@nestjs/testing';
import { GetRunnableChatService } from './get-runnable-chat.service';
import { CreateHistoryService } from '../CreateHistory/create-history.service';

describe('GetRunnableChatService', () => {
  let service: GetRunnableChatService;

  const mockCreateHistoryService = {
    execute: jest.fn().mockReturnValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetRunnableChatService,
        { provide: CreateHistoryService, useValue: mockCreateHistoryService },
      ],
    }).compile();

    service = module.get<GetRunnableChatService>(GetRunnableChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
