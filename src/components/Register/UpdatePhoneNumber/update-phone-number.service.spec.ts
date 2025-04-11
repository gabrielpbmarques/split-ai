import { Test, TestingModule } from '@nestjs/testing';
import { UpdatePhoneNumberService } from './update-phone-number.service';

describe('UpdatePhoneNumberService', () => {
  let service: UpdatePhoneNumberService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UpdatePhoneNumberService],
    }).compile();

    service = module.get<UpdatePhoneNumberService>(UpdatePhoneNumberService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
