import { Test, TestingModule } from '@nestjs/testing';
import { VerifyExistingUserService } from './verify-existing-user.service';

describe('VerifyExistingUserService', () => {
  let service: VerifyExistingUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VerifyExistingUserService],
    }).compile();

    service = module.get<VerifyExistingUserService>(VerifyExistingUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
