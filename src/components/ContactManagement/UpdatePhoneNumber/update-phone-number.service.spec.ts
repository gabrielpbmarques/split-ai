import { Test, TestingModule } from '@nestjs/testing';
import { UpdatePhoneNumberService } from './update-phone-number.service';
import { PhoneRepository } from 'src/repositories/Phone.repository';
import { WorkerRepository } from 'src/repositories/Worker.repository';

describe('UpdatePhoneNumberService', () => {
  let service: UpdatePhoneNumberService;

  const mockPhoneRepository = {
    create: jest.fn().mockResolvedValue({ _id: '123' }),
    update: jest.fn().mockResolvedValue({}),
  };

  const mockWorkerRepository = {
    update: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatePhoneNumberService,
        { provide: PhoneRepository, useValue: mockPhoneRepository },
        { provide: WorkerRepository, useValue: mockWorkerRepository },
      ],
    }).compile();

    service = module.get<UpdatePhoneNumberService>(UpdatePhoneNumberService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
