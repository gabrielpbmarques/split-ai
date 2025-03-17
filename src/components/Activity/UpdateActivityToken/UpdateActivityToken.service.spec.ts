import { Test, TestingModule } from '@nestjs/testing';
import { UpdateActivityTokenService } from './UpdateActivityToken.service';
import { ActivityRepository } from 'src/repositories/Activity.repository';
import { Activity } from 'src/models/Activity.model';
import { ObjectId } from 'mongoose';
import { TokenType } from 'src/types/TokenType';

describe('UpdateActivityTokenService', () => {
  let service: UpdateActivityTokenService;
  let activityRepository: ActivityRepository;

  const mockActivityRepository = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateActivityTokenService,
        {
          provide: ActivityRepository,
          useValue: mockActivityRepository,
        },
      ],
    }).compile();

    service = module.get<UpdateActivityTokenService>(
      UpdateActivityTokenService,
    );
    activityRepository = module.get<ActivityRepository>(ActivityRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    const activityId = '6507f6d52c5ee7243c7b987a' as unknown as ObjectId;
    const tokenId = '67d86a4cf303cb5bc7afc4fa' as unknown as ObjectId;
    const mockToken = {
      _id: tokenId,
      type: 'checkIn' as TokenType,
      validated: true,
      validatedAt: new Date(),
    };
    let mockActivity: Partial<Activity>;

    beforeEach(() => {
      mockActivity = {
        _id: activityId,
        tokens: [],
        // Adding minimal required properties
        additionalInfo: [],
        dynamicProducts: [],
        entries: [],
        excludedBadgesId: [],
        executionProblems: [],
        expiredProductsId: [],
        foundProductsId: [],
        minimumWarehousePictures: 3,
        nearExpirationProductsId: [],
        outOfShelfProductsId: [],
        outOfStorageProductsId: [],
        pickingOrdersIds: [],
        picturesFinishId: [],
        picturesStartId: [],
        productCountIds: [],
        productPricesId: [],
        ratingIds: [],
        ratingReasonsIds: [],
        requiredBadgesId: [],
        requirements: [],
        rescheduleCount: 0,
        restockedProductsId: [],
        ruptureChecks: [],
        ruptureProductsId: [],
        shelfShareConfigIds: [],
        isSubsidized: false,
        availableForGigWorkers: true,
        isTrial: false,
        isRemoved: false,
        removedAt: null,
        jobId: 'job-id',
        userId: 'user-id',
        companyId: 'company-id',
        productGroupId: 'product-group-id',
        establishmentId: 'establishment-id',
        expiredProductCountConfig: null,
        missionType: 'mission-type',
        status: 'status',
        price: 100,
        retryable: false,
        jobType: null,
        description: 'description',
        videoUri: '',
        __v: 0,
      };

      mockActivityRepository.findById.mockResolvedValue(mockActivity);
      mockActivityRepository.update.mockImplementation((id, activity) =>
        Promise.resolve(activity),
      );
    });

    it('should update activity with token data', async () => {
      const result = await service.execute(
        mockToken,
        activityId as unknown as string,
      );

      expect(activityRepository.findById).toHaveBeenCalledWith(activityId);
      expect(activityRepository.update).toHaveBeenCalledWith(activityId, {
        ...mockActivity,
        tokens: [
          {
            _id: tokenId,
            type: 'checkIn',
            validated: true,
            validatedAt: expect.any(Date),
          },
        ],
      });
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0]._id).toEqual(tokenId);
    });

    it('should throw an error if activity is not found', async () => {
      mockActivityRepository.findById.mockResolvedValue(null);

      await expect(
        service.execute(mockToken, activityId as unknown as string),
      ).rejects.toThrow('Activity not found');
      expect(activityRepository.update).not.toHaveBeenCalled();
    });

    it('should add token to existing tokens array', async () => {
      const existingToken = {
        _id: '67d86a4cf303cb5bc7afc4fa' as unknown as ObjectId,
        type: 'checkOut' as TokenType,
        validated: true,
        validatedAt: new Date(),
      };
      mockActivity.tokens = [existingToken];

      const result = await service.execute(
        mockToken,
        activityId as unknown as string,
      );

      expect(result.tokens).toHaveLength(2);
      expect(result.tokens).toContainEqual(existingToken);
      expect(result.tokens).toContainEqual({
        _id: tokenId,
        type: 'checkIn',
        validated: true,
        validatedAt: expect.any(Date),
      });
    });
  });
});
