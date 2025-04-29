import { Test, TestingModule } from '@nestjs/testing';
import { UpdateLastAiResponseService } from 'src/components/SessionManagement/UpdateLastAiResponse/update-last-ai-response.service';
import { SessionRepository } from 'src/repositories/Session.repository';

describe('UpdateLastAiResponseService', () => {
  let service: UpdateLastAiResponseService;

  const mockSessionRepository = {
    update: jest.fn().mockResolvedValue({}),
    findById: jest.fn().mockResolvedValue(null),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateLastAiResponseService,
        { provide: SessionRepository, useValue: mockSessionRepository },
      ],
    }).compile();

    service = module.get<UpdateLastAiResponseService>(
      UpdateLastAiResponseService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
