import { Test, TestingModule } from '@nestjs/testing';
import { BuildSystemPromptService } from './build-system-prompt.service';

describe('BuildSystemPromptService', () => {
  let service: BuildSystemPromptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BuildSystemPromptService],
    }).compile();

    service = module.get<BuildSystemPromptService>(BuildSystemPromptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
