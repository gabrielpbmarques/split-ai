import { Test, TestingModule } from '@nestjs/testing';
import { ExecuteSimilaritySearchService } from '../ExecuteSimilaritySearch/execute-similarity-search.service';
import { GetRunnableChatService } from '../GetRunnableChat/get-runnable-chat.service';
import { LoadAiChatService } from './load-ai-chat.service';
import { LoadVectorStoreService } from '../LoadVectorStore/load-vector-store.service';
import { FillPromptService } from '../FillPrompt/fill-prompt.service';

describe('LoadAiChatService', () => {
  let service: LoadAiChatService;

  const mockFillPromptService = {
    execute: jest.fn().mockResolvedValue({}),
  };

  const mockGetRunnableChatService = {
    execute: jest.fn().mockResolvedValue({}),
  };

  const mockLoadVectorStoreService = {
    execute: jest.fn().mockResolvedValue({}),
  };

  const mockExecuteSimilaritySearchService = {
    execute: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoadAiChatService,
        { provide: FillPromptService, useValue: mockFillPromptService },
        {
          provide: GetRunnableChatService,
          useValue: mockGetRunnableChatService,
        },
        {
          provide: LoadVectorStoreService,
          useValue: mockLoadVectorStoreService,
        },
        {
          provide: ExecuteSimilaritySearchService,
          useValue: mockExecuteSimilaritySearchService,
        },
      ],
    }).compile();

    service = module.get<LoadAiChatService>(LoadAiChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
