import { Test, TestingModule } from '@nestjs/testing';
import { CalculateCheckDigitService } from './CalculateCheckDigit.service';

describe('CalculateCheckDigitService', () => {
  let service: CalculateCheckDigitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CalculateCheckDigitService],
    }).compile();

    service = module.get<CalculateCheckDigitService>(
      CalculateCheckDigitService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should calculate the check digit correctly', () => {
      // Example calculations
      expect(service.execute('123456')).toBe(
        (1 * 2 + 2 * 3 + 3 * 5 + 4 * 7 + 5 * 11 + 6 * 13) % 10,
      );
      expect(service.execute('000000')).toBe(0);
      expect(service.execute('999999')).toBe(
        (9 * 2 + 9 * 3 + 9 * 5 + 9 * 7 + 9 * 11 + 9 * 13) % 10,
      );
    });

    it('should handle tokens of different lengths by cycling through prime numbers', () => {
      expect(service.execute('1234')).toBe(
        (1 * 2 + 2 * 3 + 3 * 5 + 4 * 7) % 10,
      );
      expect(service.execute('12345678')).toBe(
        (1 * 2 + 2 * 3 + 3 * 5 + 4 * 7 + 5 * 11 + 6 * 13 + 7 * 2 + 8 * 3) % 10,
      );
    });

    it('should return the same check digit for the same input', () => {
      const input = '555555';
      const result1 = service.execute(input);
      const result2 = service.execute(input);

      expect(result1).toBe(result2);
    });
  });
});
