import { Test, TestingModule } from '@nestjs/testing';
import { CheckActivityTokenNeedService } from './CheckActivityTokenNeed.service';
import { TokenRepository } from 'src/repositories/Token.repository';
import { Token } from 'src/models/Token.model';

describe('CheckActivityTokenNeedService', () => {
  let service: CheckActivityTokenNeedService;
  let tokenRepository: jest.Mocked<TokenRepository>;

  beforeEach(async () => {
    // Create mock for TokenRepository
    const mockTokenRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckActivityTokenNeedService,
        {
          provide: TokenRepository,
          useValue: mockTokenRepository,
        },
      ],
    }).compile();

    service = module.get<CheckActivityTokenNeedService>(
      CheckActivityTokenNeedService,
    );
    tokenRepository = module.get(TokenRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    const activityId = 'mock-activity-id';

    it('should return true when a token exists for the activity', async () => {
      // Arrange
      const mockToken = {
        token: 'mock-token',
        expiresAt: new Date(),
      } as Token;

      tokenRepository.findOne.mockResolvedValue(mockToken);

      // Act
      const result = await service.execute(activityId);

      // Assert
      expect(tokenRepository.findOne).toHaveBeenCalledWith({ activityId });
      expect(result).toBe(true);
    });

    it('should return false when no token exists for the activity', async () => {
      // Arrange
      tokenRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.execute(activityId);

      // Assert
      expect(tokenRepository.findOne).toHaveBeenCalledWith({ activityId });
      expect(result).toBe(false);
    });
  });
});
