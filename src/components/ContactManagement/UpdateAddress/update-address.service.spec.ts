import { Test, TestingModule } from '@nestjs/testing';
import { UpdateAddressService } from './update-address.service';
import { AddressRepository } from 'src/repositories/Address.repository';
import { WorkerRepository } from 'src/repositories/Worker.repository';

describe('UpdateAddressService', () => {
  let service: UpdateAddressService;

  const mockAddressRepository = {
    create: jest.fn().mockResolvedValue({ _id: '123' }),
    update: jest.fn().mockResolvedValue({}),
  };

  const mockWorkerRepository = {
    update: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateAddressService,
        { provide: AddressRepository, useValue: mockAddressRepository },
        { provide: WorkerRepository, useValue: mockWorkerRepository },
      ],
    }).compile();

    service = module.get<UpdateAddressService>(UpdateAddressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
