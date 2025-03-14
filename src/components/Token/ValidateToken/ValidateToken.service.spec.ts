import { Test, TestingModule } from '@nestjs/testing';
import { ValidateTokenService } from './ValidateToken.service';

describe('ValidateTokenService', () => {
  let service: ValidateTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ValidateTokenService],
    }).compile();

    service = module.get<ValidateTokenService>(ValidateTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
