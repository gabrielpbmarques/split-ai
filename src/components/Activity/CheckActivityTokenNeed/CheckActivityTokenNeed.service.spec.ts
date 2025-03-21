import { Test, TestingModule } from '@nestjs/testing';
import { CheckActivityTokenNeedService } from './CheckActivityTokenNeed.service';
import { ActivityRepository } from 'src/repositories/Activity.repository';
import { EstablishmentRepository } from 'src/repositories/Establishment.repository';
import { Activity } from 'src/models/Activity.model';
import { Establishment } from 'src/models/Establishment.model';

describe('CheckActivityTokenNeedService', () => {
  let service: CheckActivityTokenNeedService;
  let activityRepository: jest.Mocked<ActivityRepository>;
  let establishmentRepository: jest.Mocked<EstablishmentRepository>;

  beforeEach(async () => {
    // Create mocks for repositories
    const mockActivityRepository = {
      findById: jest.fn(),
    };

    const mockEstablishmentRepository = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckActivityTokenNeedService,
        {
          provide: ActivityRepository,
          useValue: mockActivityRepository,
        },
        {
          provide: EstablishmentRepository,
          useValue: mockEstablishmentRepository,
        },
      ],
    }).compile();

    service = module.get<CheckActivityTokenNeedService>(
      CheckActivityTokenNeedService,
    );
    activityRepository = module.get(ActivityRepository);
    establishmentRepository = module.get(EstablishmentRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    const activityId = 'mock-activity-id';
    const establishmentId = 'mock-establishment-id';

    it('should return true when establishment has token generation access', async () => {
      // Arrange
      const mockActivity = {
        id: activityId,
        establishmentId: establishmentId,
      } as any as Activity;

      const mockEstablishment = {
        id: establishmentId,
        hasTokenGenerationAccess: true,
      } as any as Establishment;

      activityRepository.findById.mockResolvedValue(mockActivity);
      establishmentRepository.findById.mockResolvedValue(mockEstablishment);

      // Act
      const result = await service.execute(activityId);

      // Assert
      expect(activityRepository.findById).toHaveBeenCalledWith(activityId);
      expect(establishmentRepository.findById).toHaveBeenCalledWith(
        establishmentId,
      );
      expect(result).toBe(true);
    });

    it('should return false when establishment does not have token generation access', async () => {
      // Arrange
      const mockActivity = {
        id: activityId,
        establishmentId: establishmentId,
      } as any as Activity;

      const mockEstablishment = {
        id: establishmentId,
        hasTokenGenerationAccess: false,
      } as any as Establishment;

      activityRepository.findById.mockResolvedValue(mockActivity);
      establishmentRepository.findById.mockResolvedValue(mockEstablishment);

      // Act
      const result = await service.execute(activityId);

      // Assert
      expect(activityRepository.findById).toHaveBeenCalledWith(activityId);
      expect(establishmentRepository.findById).toHaveBeenCalledWith(
        establishmentId,
      );
      expect(result).toBe(false);
    });
  });
});
