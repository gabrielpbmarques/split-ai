import { Test, TestingModule } from '@nestjs/testing';
import { SaveSessionService } from './save-session.service';

describe('SaveSessionService', () => {
  let service: SaveSessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SaveSessionService],
    }).compile();

    service = module.get<SaveSessionService>(SaveSessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
