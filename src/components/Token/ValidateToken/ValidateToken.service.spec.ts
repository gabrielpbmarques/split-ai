import { Test, TestingModule } from '@nestjs/testing';
import { ValidateTokenService } from './ValidateToken.service';
import { TokenRepository } from 'src/repositories/Token.repository';
import { CalculateCheckDigitService } from '../CalculateCheckDigit/CalculateCheckDigit.service';
import { UpdateActivityTokenService } from 'src/components/Activity/UpdateActivityToken/UpdateActivityToken.service';
import { ValidateTokenDTO } from './ValidateToken.dto';
import { ObjectId } from 'mongoose';
import { Token } from 'src/models/Token.model';

describe('ValidateTokenService', () => {
  let service: ValidateTokenService;
  let tokenRepository: TokenRepository;
  let calculateCheckDigitService: CalculateCheckDigitService;
  let updateActivityTokenService: UpdateActivityTokenService;

  const mockTokenRepository = {
    findOne: jest.fn(),
    updateOne: jest.fn(),
  };

  const mockCalculateCheckDigitService = {
    execute: jest.fn(),
  };

  const mockUpdateActivityTokenService = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidateTokenService,
        {
          provide: TokenRepository,
          useValue: mockTokenRepository,
        },
        {
          provide: CalculateCheckDigitService,
          useValue: mockCalculateCheckDigitService,
        },
        {
          provide: UpdateActivityTokenService,
          useValue: mockUpdateActivityTokenService,
        },
      ],
    }).compile();

    service = module.get<ValidateTokenService>(ValidateTokenService);
    tokenRepository = module.get<TokenRepository>(TokenRepository);
    calculateCheckDigitService = module.get<CalculateCheckDigitService>(
      CalculateCheckDigitService,
    );
    updateActivityTokenService = module.get<UpdateActivityTokenService>(
      UpdateActivityTokenService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    let validateTokenDto: ValidateTokenDTO;
    let workerId: string;
    let mockToken: Partial<Token>;
    const tokenId = '67d86a4cf303cb5bc7afc4fa' as unknown as ObjectId;

    beforeEach(() => {
      validateTokenDto = {
        activityId: '6507f6d52c5ee7243c7b987a',
        token: '5555557',
        type: 'checkIn',
      };
      workerId = '6507f6d52c5ee7243c7b987b';

      mockToken = {
        _id: tokenId,
        token: '5555557',
        activityId: '6507f6d52c5ee7243c7b987a' as unknown as ObjectId,
        workerId: '6507f6d52c5ee7243c7b987b' as unknown as ObjectId,
        type: 'checkIn',
        validated: false,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour in the future
      };

      mockTokenRepository.findOne.mockResolvedValue(mockToken);
      mockCalculateCheckDigitService.execute.mockReturnValue(7);
      mockTokenRepository.updateOne.mockResolvedValue({
        ...mockToken,
        validated: true,
        validatedAt: expect.any(Date),
      });
      mockUpdateActivityTokenService.execute.mockResolvedValue({ tokens: [] });
    });

    it('should validate a token successfully', async () => {
      const result = await service.execute(validateTokenDto, workerId);

      expect(tokenRepository.findOne).toHaveBeenCalledWith({
        workerId,
        activityId: validateTokenDto.activityId,
        type: validateTokenDto.type,
        token: validateTokenDto.token,
      });
      expect(calculateCheckDigitService.execute).toHaveBeenCalledWith('555555');
      expect(tokenRepository.updateOne).toHaveBeenCalledWith(tokenId, {
        validated: true,
        validatedAt: expect.any(Date),
      });
      expect(updateActivityTokenService.execute).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should throw an error if token is not found', async () => {
      mockTokenRepository.findOne.mockResolvedValue(null);

      await expect(service.execute(validateTokenDto, workerId)).rejects.toThrow(
        'Token inválido',
      );
      expect(tokenRepository.updateOne).not.toHaveBeenCalled();
    });

    it('should throw an error if token is already validated', async () => {
      mockTokenRepository.findOne.mockResolvedValue({
        ...mockToken,
        validated: true,
      });

      await expect(service.execute(validateTokenDto, workerId)).rejects.toThrow(
        'Token já validado',
      );
      expect(tokenRepository.updateOne).not.toHaveBeenCalled();
    });

    it('should throw an error if token is expired', async () => {
      mockTokenRepository.findOne.mockResolvedValue({
        ...mockToken,
        expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
      });

      await expect(service.execute(validateTokenDto, workerId)).rejects.toThrow(
        'Token expirado',
      );
      expect(tokenRepository.updateOne).not.toHaveBeenCalled();
    });

    it('should throw an error if check digit is invalid', async () => {
      mockCalculateCheckDigitService.execute.mockReturnValue(5); // Different check digit

      await expect(service.execute(validateTokenDto, workerId)).rejects.toThrow(
        'Token inválido',
      );
      expect(tokenRepository.updateOne).not.toHaveBeenCalled();
    });

    it('should return false for malformed token', async () => {
      validateTokenDto.token = 'invalidformat';

      const result = await service.execute(validateTokenDto, workerId);

      expect(result).toBe(false);
      expect(tokenRepository.updateOne).not.toHaveBeenCalled();
    });
  });
});
