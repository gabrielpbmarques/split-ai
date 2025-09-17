import { Test, TestingModule } from '@nestjs/testing';
import { FaceMatchService } from './face-match.service';

describe('FaceMatchService', () => {
  let service: FaceMatchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FaceMatchService],
    }).compile();

    service = module.get<FaceMatchService>(FaceMatchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
