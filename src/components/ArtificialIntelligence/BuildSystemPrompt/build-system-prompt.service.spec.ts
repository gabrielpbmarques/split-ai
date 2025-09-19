import { Test, TestingModule } from '@nestjs/testing';

import { NormalizePromptInstructionsService } from '../NormalizePromptInstructions/normalize-prompt-instructions.service';

import { BuildSystemPromptService } from './build-system-prompt.service';

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
