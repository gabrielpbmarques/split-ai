import { Test, TestingModule } from '@nestjs/testing';
import { FillPromptService } from 'src/components/Prompt/FillPrompt/fill-prompt.service';
import { BuildSystemPromptService } from 'src/components/Prompt/BuildSystemPrompt/build-system-prompt.service';

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
