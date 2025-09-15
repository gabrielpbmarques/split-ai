import { Test, TestingModule } from '@nestjs/testing';
import { BuildSystemPromptService } from 'src/components/Prompt/BuildSystemPrompt/build-system-prompt.service';
import { NormalizePromptInstructionsService } from 'src/components/Prompt/NormalizePromptInstructions/normalize-prompt-instructions.service';

describe('BuildSystemPromptService', () => {
  let service: BuildSystemPromptService;

  const mockNormalizePromptInstructionsService = {
    execute: jest.fn().mockReturnValue('Normalized prompt'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuildSystemPromptService,
        {
          provide: NormalizePromptInstructionsService,
          useValue: mockNormalizePromptInstructionsService,
        },
      ],
    }).compile();

    service = module.get<BuildSystemPromptService>(BuildSystemPromptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
