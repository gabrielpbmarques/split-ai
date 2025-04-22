import { Test, TestingModule } from '@nestjs/testing';
import { FillPromptService } from './fill-prompt.service';
import { BuildSystemPromptService } from '../BuildSystemPrompt/build-system-prompt.service';

describe('FillPromptService', () => {
  let service: FillPromptService;

  const mockBuildSystemPromptService = {
    execute: jest.fn().mockReturnValue('System prompt'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FillPromptService,
        {
          provide: BuildSystemPromptService,
          useValue: mockBuildSystemPromptService,
        },
      ],
    }).compile();

    service = module.get<FillPromptService>(FillPromptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
