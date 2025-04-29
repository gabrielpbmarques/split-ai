import { Test, TestingModule } from '@nestjs/testing';
import { UpdateBankAccountService } from 'src/components/FinancialManagement/UpdateBankAccount/update-bank-account.service';
import { BankAccountRepository } from 'src/repositories/BankAccount.repository';
import { WorkerRepository } from 'src/repositories/Worker.repository';

describe('UpdateBankAccountService', () => {
  let service: UpdateBankAccountService;

  const mockBankAccountRepository = {
    create: jest.fn().mockResolvedValue({ _id: '123' }),
    update: jest.fn().mockResolvedValue({}),
  };

  const mockWorkerRepository = {
    update: jest.fn().mockResolvedValue({}),
    findById: jest.fn().mockResolvedValue(null),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateBankAccountService,
        { provide: BankAccountRepository, useValue: mockBankAccountRepository },
        { provide: WorkerRepository, useValue: mockWorkerRepository },
      ],
    }).compile();

    service = module.get<UpdateBankAccountService>(UpdateBankAccountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
