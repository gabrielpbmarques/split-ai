import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { CreateTokenService } from './CreateToken.service';
import { TokenRepository } from 'src/repositories/Token.repository';
import { ActivityRepository } from 'src/repositories/Activity.repository';
import { CalculateCheckDigitService } from '../CalculateCheckDigit/CalculateCheckDigit.service';
import { CreateTokenDTO } from './CreateToken.dto';
import { config } from 'src/config';
import { UserType } from '../../../decorators/roles.decorator';

describe('CreateTokenService', () => {
  let service: CreateTokenService;
  let tokenRepository: TokenRepository;
  let activityRepository: ActivityRepository;
  let calculateCheckDigitService: CalculateCheckDigitService;

  const mockTokenRepository = {
    create: jest.fn(),
    findByWorkerAndActivity: jest.fn(),
  };

  const mockActivityRepository = {
    checkEstablishmentTokenAccess: jest.fn(),
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
          provide: ActivityRepository,
          useValue: mockActivityRepository,
        },
        {
          provide: CalculateCheckDigitService,
          useValue: mockCalculateCheckDigitService,
        },
      ],
    }).compile();

    service = module.get<CreateTokenService>(CreateTokenService);
    tokenRepository = module.get<TokenRepository>(TokenRepository);
    activityRepository = module.get<ActivityRepository>(ActivityRepository);
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
      mockTokenRepository.create.mockImplementation(() => {
        return Promise.resolve({
          token: '5555557',
          expiresAt: new Date(),
        });
      });

      // Mock the establishment token access check
      mockActivityRepository.checkEstablishmentTokenAccess.mockResolvedValue(
        true,
      );
    });

    afterEach(() => {
      jest.spyOn(global.Math, 'random').mockRestore();
    });

    it('should create a checkIn token successfully', async () => {
      const result = await service.execute(createTokenDto, 'establishment');

      expect(
        activityRepository.checkEstablishmentTokenAccess,
      ).toHaveBeenCalledWith(createTokenDto.activityId);
      expect(calculateCheckDigitService.execute).toHaveBeenCalledWith('555555');
      expect(tokenRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          token: '5555557',
          activityId: expect.any(String),
          workerId: expect.any(String),
          type: 'checkIn',
          validated: false,
        }),
      );
      expect(result).toEqual({
        token: '5555557',
        expiresAt: expect.any(Date),
      });
    });

    it('should create a checkOut token successfully', async () => {
      createTokenDto.type = 'checkOut';

      const result = await service.execute(createTokenDto, 'establishment');

      expect(
        activityRepository.checkEstablishmentTokenAccess,
      ).toHaveBeenCalledWith(createTokenDto.activityId);
      expect(tokenRepository.create).toHaveBeenCalled();
      expect(result).toEqual({
        token: '5555557',
        expiresAt: expect.any(Date),
      });
    });

    it('should bypass establishment access validation for admin users', async () => {
      // Mock the establishment token access check to return false
      mockActivityRepository.checkEstablishmentTokenAccess.mockResolvedValue(
        false,
      );

      // Execute with admin userType
      const result = await service.execute(createTokenDto, 'admin');

      // Verify the access check was not called for admin users
      expect(
        activityRepository.checkEstablishmentTokenAccess,
      ).not.toHaveBeenCalled();

      // Verify token was created successfully
      expect(tokenRepository.create).toHaveBeenCalled();
      expect(result).toEqual({
        token: '5555557',
        expiresAt: expect.any(Date),
      });
    });

    it('should throw an error when establishment does not have token access and user is not admin', async () => {
      // Mock the establishment token access check to return false
      mockActivityRepository.checkEstablishmentTokenAccess.mockResolvedValue(
        false,
      );

      // Execute with non-admin userType
      await expect(
        service.execute(createTokenDto, 'establishment'),
      ).rejects.toThrow(UnauthorizedException);

      // Verify the access check was called
      expect(
        activityRepository.checkEstablishmentTokenAccess,
      ).toHaveBeenCalledWith(createTokenDto.activityId);

      // Verify token was not created
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
