import { Test, type TestingModule } from '@nestjs/testing';

import { NormalizePromptInstructionsService } from 'src/modules/agent-runtime/normalize-prompt-instructions/normalize-prompt-instructions.service';

describe('NormalizePromptInstructionsService', () => {
  let service: NormalizePromptInstructionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NormalizePromptInstructionsService],
    }).compile();

    service = module.get<NormalizePromptInstructionsService>(
      NormalizePromptInstructionsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
