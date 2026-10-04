import { Test, TestingModule } from '@nestjs/testing';

import { BuildSystemPromptService } from 'src/modules/agent-runtime/build-system-prompt/build-system-prompt.service';
import { NormalizePromptInstructionsService } from 'src/modules/agent-runtime/normalize-prompt-instructions/normalize-prompt-instructions.service';

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
