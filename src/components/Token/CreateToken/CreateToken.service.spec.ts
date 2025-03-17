import { Test, TestingModule } from '@nestjs/testing';
import { CreateTokenService } from './CreateToken.service';
import { TokenRepository } from 'src/repositories/Token.repository';
import { CalculateCheckDigitService } from '../CalculateCheckDigit/CalculateCheckDigit.service';
import { CreateTokenDTO } from './CreateToken.dto';
import { config } from 'src/config';

describe('CreateTokenService', () => {
  let service: CreateTokenService;
  let tokenRepository: TokenRepository;
  let calculateCheckDigitService: CalculateCheckDigitService;

  const mockTokenRepository = {
    create: jest.fn(),
    findByWorkerAndActivity: jest.fn(),
  };

  const mockCalculateCheckDigitService = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTokenService,
        {
          provide: TokenRepository,
          useValue: mockTokenRepository,
        },
        {
          provide: CalculateCheckDigitService,
          useValue: mockCalculateCheckDigitService,
        },
      ],
    }).compile();

    service = module.get<CreateTokenService>(CreateTokenService);
    tokenRepository = module.get<TokenRepository>(TokenRepository);
    calculateCheckDigitService = module.get<CalculateCheckDigitService>(
      CalculateCheckDigitService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    let createTokenDto: CreateTokenDTO;

    beforeEach(() => {
      createTokenDto = {
        activityId: '6507f6d52c5ee7243c7b987a',
        workerId: '6507f6d52c5ee7243c7b987b',
        type: 'checkIn',
      };

      // Mock Math.random to return a predictable sequence
      jest.spyOn(global.Math, 'random').mockReturnValue(0.5);

      // Mock the check digit calculation
      mockCalculateCheckDigitService.execute.mockReturnValue(7);

      // Mock the token creation
      mockTokenRepository.create.mockResolvedValue({
        token: '555555-7',
        expiresAt: expect.any(Date),
      });
    });

    afterEach(() => {
      jest.spyOn(global.Math, 'random').mockRestore();
    });

    it('should create a checkIn token successfully', async () => {
      const result = await service.execute(createTokenDto);

      expect(tokenRepository.findByWorkerAndActivity).not.toHaveBeenCalled();
      expect(calculateCheckDigitService.execute).toHaveBeenCalledWith('555555');
      expect(tokenRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          token: '555555-7',
          activityId: expect.stringMatching('6507f6d52c5ee7243c7b987a'),
          workerId: expect.stringMatching('6507f6d52c5ee7243c7b987b'),
          type: 'checkIn',
          validated: false,
        }),
      );
      expect(result).toEqual({
        token: '555555-7',
        expiresAt: expect.any(Date),
      });
    });

    it('should create a checkOut token if checkIn exists', async () => {
      createTokenDto.type = 'checkOut';
      mockTokenRepository.findByWorkerAndActivity.mockResolvedValueOnce({
        token: 'existing-token',
      });

      const result = await service.execute(createTokenDto);

      expect(tokenRepository.findByWorkerAndActivity).toHaveBeenCalledWith(
        createTokenDto.workerId,
        createTokenDto.activityId,
        'checkIn',
      );
      expect(tokenRepository.create).toHaveBeenCalled();
      expect(result).toEqual({
        token: '555555-7',
        expiresAt: expect.any(Date),
      });
    });

    it('should throw an error when trying to create checkOut without checkIn', async () => {
      createTokenDto.type = 'checkOut';
      mockTokenRepository.findByWorkerAndActivity.mockResolvedValueOnce(null);

      await expect(service.execute(createTokenDto)).rejects.toThrow(
        'É necessário solicitar o checkIn antes',
      );
      expect(tokenRepository.create).not.toHaveBeenCalled();
    });

    it('should use provided expiresAt date if provided', async () => {
      const customDate = new Date('2023-01-01');
      createTokenDto.expiresAt = customDate;

      await service.execute(createTokenDto);

      expect(tokenRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          expiresAt: customDate,
        }),
      );
    });

    it('should calculate expiresAt based on config if not provided', async () => {
      const now = new Date('2023-01-01T12:00:00Z');
      jest
        .spyOn(global, 'Date')
        .mockImplementationOnce(() => now as unknown as Date);

      await service.execute(createTokenDto);

      expect(tokenRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          expiresAt: new Date(now.getTime() + config.tokenExpirationTime),
        }),
      );

      jest.spyOn(global, 'Date').mockRestore();
    });
  });
});
