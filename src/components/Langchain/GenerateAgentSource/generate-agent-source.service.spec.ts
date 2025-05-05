import { Test, TestingModule } from '@nestjs/testing';
import { GenerateAgentSourceService } from './generate-agent-source.service';

describe('GenerateAgentSourceService', () => {
  let service: GenerateAgentSourceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GenerateAgentSourceService],
    }).compile();

    service = module.get<GenerateAgentSourceService>(
      GenerateAgentSourceService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
