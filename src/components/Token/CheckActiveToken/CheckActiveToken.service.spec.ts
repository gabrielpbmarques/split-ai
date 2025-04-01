import { Test, TestingModule } from '@nestjs/testing';
import { CheckActiveTokenService } from './CheckActiveToken.service';
import { TokenRepository } from 'src/repositories/Token.repository';
import { Token } from 'src/models/Token.model';
import { TokenType } from 'src/types/TokenType';
import { ObjectId } from 'mongoose';

describe('CheckActiveTokenService', () => {
  let service: CheckActiveTokenService;
  let tokenRepository: jest.Mocked<TokenRepository>;

  const mockTokenRepository = {
    findOne: jest.fn(),
  };

  const mockToken: Token = {
    _id: '507f1f77bcf86cd799439011' as unknown as ObjectId,
    token: 'abc123',
    expiresAt: new Date(Date.now() + 3600000), // 1 hour in the future
    activityId: '507f1f77bcf86cd799439022' as unknown as ObjectId,
    workerId: '507f1f77bcf86cd799439033' as unknown as ObjectId,
    type: 'checkIn' as TokenType,
    validated: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckActiveTokenService,
        {
          provide: TokenRepository,
          useValue: mockTokenRepository,
        },
      ],
    }).compile();

    service = module.get<CheckActiveTokenService>(CheckActiveTokenService);
    tokenRepository = module.get(TokenRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should find an active token when it exists and is not expired', async () => {
      // Arrange
      const token = 'abc123';
      const activityId = '507f1f77bcf86cd799439022';
      const type: TokenType = 'checkIn';

      mockTokenRepository.findOne.mockResolvedValueOnce(mockToken);

      // Act
      const result = await service.execute(activityId, type);

      // Assert
      expect(tokenRepository.findOne).toHaveBeenCalledWith({
        activityId,
        type,
        expiresAt: {
          $gte: expect.any(String),
        },
      });
      expect(result).toEqual(mockToken);
    });

    it('should return null when no active token is found', async () => {
      // Arrange
      const token = 'nonexistentToken';
      const activityId = '507f1f77bcf86cd799439022';
      const type: TokenType = 'checkIn';

      mockTokenRepository.findOne.mockResolvedValueOnce(null);

      // Act
      const result = await service.execute(activityId, type);

      // Assert
      expect(tokenRepository.findOne).toHaveBeenCalledWith({
        activityId,
        type,
        expiresAt: {
          $gte: expect.any(String),
        },
      });
      expect(result).toBeNull();
    });

    it('should check if token expiration date is greater than or equal to current date', async () => {
      // Arrange
      const token = 'abc123';
      const activityId = '507f1f77bcf86cd799439022';
      const type: TokenType = 'checkOut';

      // Mock Date.now to get consistent results
      const mockNow = new Date('2025-04-01T10:00:00Z');
      jest
        .spyOn(global, 'Date')
        .mockImplementation(() => mockNow as unknown as Date);

      // Act
      await service.execute(activityId, type);

      // Assert
      expect(tokenRepository.findOne).toHaveBeenCalledWith({
        activityId,
        type,
        expiresAt: {
          $gte: mockNow.toISOString(),
        },
      });

      // Restore original Date implementation
      jest.restoreAllMocks();
    });

    it('should work with different token types', async () => {
      // Arrange
      const token = 'abc123';
      const activityId = '507f1f77bcf86cd799439022';
      const type: TokenType = 'checkOut';

      const mockCheckOutToken = {
        ...mockToken,
        type: 'checkOut' as TokenType,
      };

      mockTokenRepository.findOne.mockResolvedValueOnce(mockCheckOutToken);

      // Act
      const result = await service.execute(activityId, type);

      // Assert
      expect(tokenRepository.findOne).toHaveBeenCalledWith({
        activityId,
        type,
        expiresAt: {
          $gte: expect.any(String),
        },
      });
      expect(result).toEqual(mockCheckOutToken);
    });
  });
});
