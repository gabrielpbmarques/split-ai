import { Test, TestingModule } from '@nestjs/testing';
import { UpdateAddressService } from './update-address.service';

describe('UpdateAddressService', () => {
  let service: UpdateAddressService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UpdateAddressService],
    }).compile();

    service = module.get<UpdateAddressService>(UpdateAddressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
