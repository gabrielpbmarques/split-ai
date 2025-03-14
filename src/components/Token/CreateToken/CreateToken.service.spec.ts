import { Test, TestingModule } from '@nestjs/testing';
import { CreateTokenService } from './CreateToken.service';

describe('CreateTokenService', () => {
  let service: CreateTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreateTokenService],
    }).compile();

    service = module.get<CreateTokenService>(CreateTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
