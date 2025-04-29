import { Test, TestingModule } from '@nestjs/testing';
import { SaveWorkerService } from 'src/components/Register/SaveWorker/save-worker.service';
import { WorkerRepository } from 'src/repositories/Worker.repository';
import { UpdatePhoneNumberService } from 'src/components/ContactManagement/UpdatePhoneNumber/update-phone-number.service';
import { UpdatePixService } from 'src/components/FinancialManagement/UpdatePix/update-pix.service';
import { UpdateBankAccountService } from 'src/components/FinancialManagement/UpdateBankAccount/update-bank-account.service';
import { UpdateAddressService } from 'src/components/ContactManagement/UpdateAddress/update-address.service';
import { UpdateUserService } from 'src/components/UserManagement/UpdateUser/update-user.service';

describe('SaveWorkerService', () => {
  let service: SaveWorkerService;

  const mockWorkerRepository = {
    create: jest.fn().mockResolvedValue({ _id: '123' }),
    update: jest.fn().mockResolvedValue({}),
    findById: jest.fn().mockResolvedValue(null),
  };

  const mockUpdatePhoneNumberService = {
    execute: jest.fn().mockResolvedValue({}),
  };

  const mockUpdateBankAccountService = {
    execute: jest.fn().mockResolvedValue({}),
  };

  const mockUpdateAddressService = {
    execute: jest.fn().mockResolvedValue({}),
  };

  const mockUpdateUserService = {
    execute: jest.fn().mockResolvedValue({}),
  };

  const mockUpdatePixService = {
    execute: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SaveWorkerService,
        { provide: WorkerRepository, useValue: mockWorkerRepository },
        {
          provide: UpdatePhoneNumberService,
          useValue: mockUpdatePhoneNumberService,
        },
        {
          provide: UpdateBankAccountService,
          useValue: mockUpdateBankAccountService,
        },
        {
          provide: UpdatePixService,
          useValue: mockUpdatePixService,
        },
        { provide: UpdateAddressService, useValue: mockUpdateAddressService },
        { provide: UpdateUserService, useValue: mockUpdateUserService },
      ],
    }).compile();

    service = module.get<SaveWorkerService>(SaveWorkerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
