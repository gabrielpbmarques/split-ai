import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { CreateTokenService } from './CreateToken.service';
import { TokenRepository } from 'src/repositories/Token.repository';
import { ActivityRepository } from 'src/repositories/Activity.repository';
import { CalculateCheckDigitService } from '../CalculateCheckDigit/CalculateCheckDigit.service';
import { CheckActiveTokenService } from '../CheckActiveToken/CheckActiveToken.service';
import { CreateTokenDTO } from './CreateToken.dto';
import { config } from 'src/config';
import { UserType } from '../../../decorators/roles.decorator';

describe('CreateTokenService', () => {
  let service: CreateTokenService;
  let tokenRepository: TokenRepository;
  let activityRepository: ActivityRepository;
  let calculateCheckDigitService: CalculateCheckDigitService;
  let checkActiveTokenService: CheckActiveTokenService;

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

  const mockCheckActiveTokenService = {
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
        {
          provide: CheckActiveTokenService,
          useValue: mockCheckActiveTokenService,
        },
      ],
    }).compile();

    service = module.get<CreateTokenService>(CreateTokenService);
    tokenRepository = module.get<TokenRepository>(TokenRepository);
    activityRepository = module.get<ActivityRepository>(ActivityRepository);
    calculateCheckDigitService = module.get<CalculateCheckDigitService>(
      CalculateCheckDigitService,
    );
    checkActiveTokenService = module.get<CheckActiveTokenService>(
      CheckActiveTokenService,
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

      // Mock check active token (default: no active token found)
      mockCheckActiveTokenService.execute.mockResolvedValue(null);
    });

    afterEach(() => {
      jest.spyOn(global.Math, 'random').mockRestore();
    });

    it('should create a checkIn token successfully when no active token exists', async () => {
      const result = await service.execute(
        createTokenDto,
        'establishment',
        '67b34b58e8d3b0692b348e88',
      );

      expect(checkActiveTokenService.execute).toHaveBeenCalledWith(
        createTokenDto.activityId,
        createTokenDto.type,
      );
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
          createdBy: expect.any(String),
        }),
      );
      expect(result).toEqual({
        token: '5555557',
        expiresAt: expect.any(Date),
      });
    });

    it('should return existing token when an active token is found', async () => {
      // Mock an existing active token
      const existingToken = {
        token: 'existing123',
        expiresAt: new Date(Date.now() + 3600000),
      };
      mockCheckActiveTokenService.execute.mockResolvedValue(existingToken);

      const result = await service.execute(createTokenDto, 'establishment');

      expect(checkActiveTokenService.execute).toHaveBeenCalledWith(
        createTokenDto.activityId,
        createTokenDto.type,
      );
      // Verify a new token was not created
      expect(tokenRepository.create).not.toHaveBeenCalled();
      // Verify the existing token was returned
      expect(result).toEqual(existingToken);
    });

    it('should create a checkOut token successfully when no active token exists', async () => {
      createTokenDto.type = 'checkOut';

      const result = await service.execute(createTokenDto, 'establishment');

      expect(checkActiveTokenService.execute).toHaveBeenCalledWith(
        createTokenDto.activityId,
        createTokenDto.type,
      );
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

      // Verify active token check was performed
      expect(checkActiveTokenService.execute).toHaveBeenCalledWith(
        createTokenDto.activityId,
        createTokenDto.type,
      );

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

      // Verificamos que o serviço de checkActiveToken não é chamado neste caso
      // pois a validação de acesso falha antes
      expect(checkActiveTokenService.execute).not.toHaveBeenCalled();
    });

    it('should use provided expiresAt date if provided', async () => {
      const customDate = new Date('2023-01-01');
      createTokenDto.expiresAt = customDate;

      await service.execute(createTokenDto);

      // Verify active token check was performed
      expect(checkActiveTokenService.execute).toHaveBeenCalledWith(
        createTokenDto.activityId,
        createTokenDto.type,
      );

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
