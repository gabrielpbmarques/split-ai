import { Test, TestingModule } from '@nestjs/testing';
import { SaveSessionService } from './save-session.service';
import { SessionRepository } from 'src/repositories/Session.repository';

describe('SaveSessionService', () => {
  let service: SaveSessionService;

  const mockSessionRepository = {
    create: jest.fn().mockResolvedValue({ _id: '123' }),
    update: jest.fn().mockResolvedValue({}),
    findById: jest.fn().mockResolvedValue(null),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SaveSessionService,
        { provide: SessionRepository, useValue: mockSessionRepository },
      ],
    }).compile();

    service = module.get<SaveSessionService>(SaveSessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
