import { Test, TestingModule } from '@nestjs/testing';
import { CalculateCheckDigitService } from './CalculateCheckDigit.service';

describe('CalculateCheckDigitService', () => {
  let service: CalculateCheckDigitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CalculateCheckDigitService],
    }).compile();

    service = module.get<CalculateCheckDigitService>(CalculateCheckDigitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
