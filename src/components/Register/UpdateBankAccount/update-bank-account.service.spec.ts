import { Test, TestingModule } from '@nestjs/testing';
import { UpdateBankAccountService } from './update-bank-account.service';

describe('UpdateBankAccountService', () => {
  let service: UpdateBankAccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UpdateBankAccountService],
    }).compile();

    service = module.get<UpdateBankAccountService>(UpdateBankAccountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
