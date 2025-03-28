import { Test, TestingModule } from '@nestjs/testing';
import { CheckEstablishmentFeatureAccessService } from './CheckEstablishmentFeatureAccess.service';
import { EstablishmentRepository } from 'src/repositories/Establishment.repository';
import { Establishment } from 'src/models/Establishment.model';

describe('CheckEstablishmentFeatureAccessService', () => {
  let service: CheckEstablishmentFeatureAccessService;
  let establishmentRepository: jest.Mocked<EstablishmentRepository>;

  beforeEach(async () => {
    // Create a mock of the EstablishmentRepository
    const mockEstablishmentRepository = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckEstablishmentFeatureAccessService,
        {
          provide: EstablishmentRepository,
          useValue: mockEstablishmentRepository,
        },
      ],
    }).compile();

    service = module.get<CheckEstablishmentFeatureAccessService>(
      CheckEstablishmentFeatureAccessService,
    );
    establishmentRepository = module.get(EstablishmentRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    const establishmentId = 'mock-establishment-id';

    it('should return true when establishment has token generation access', async () => {
      // Arrange
      const mockEstablishment = {
        hasTokenGenerationAccess: true,
      } as Establishment;

      establishmentRepository.findById.mockResolvedValue(mockEstablishment);

      // Act
      const result = await service.execute(establishmentId);

      // Assert
      expect(establishmentRepository.findById).toHaveBeenCalledWith(
        establishmentId,
      );
      expect(result).toBe(true);
    });

    it('should return false when establishment does not have token generation access', async () => {
      // Arrange
      const mockEstablishment = {
        hasTokenGenerationAccess: false,
      } as Establishment;

      establishmentRepository.findById.mockResolvedValue(mockEstablishment);

      // Act
      const result = await service.execute(establishmentId);

      // Assert
      expect(establishmentRepository.findById).toHaveBeenCalledWith(
        establishmentId,
      );
      expect(result).toBe(false);
    });

    it('should return false when establishment is not found', async () => {
      // Arrange
      establishmentRepository.findById.mockResolvedValue(null);

      // Act
      const result = await service.execute(establishmentId);

      // Assert
      expect(establishmentRepository.findById).toHaveBeenCalledWith(
        establishmentId,
      );
      expect(result).toBe(false);
    });

    it('should return false when hasTokenGenerationAccess is undefined', async () => {
      // Arrange
      const mockEstablishment = {
        // hasTokenGenerationAccess property is intentionally not set
      } as Establishment;

      establishmentRepository.findById.mockResolvedValue(mockEstablishment);

      // Act
      const result = await service.execute(establishmentId);

      // Assert
      expect(establishmentRepository.findById).toHaveBeenCalledWith(
        establishmentId,
      );
      expect(result).toBe(false);
    });
  });
});
