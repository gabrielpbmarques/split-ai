import { Test, TestingModule } from '@nestjs/testing';
import { GetjobTemplatesService } from './getjob-templates.service';
import { JobRepository } from '../../../repositories/Job.repository';

describe('GetjobTemplatesService', () => {
  let service: GetjobTemplatesService;
  let jobRepositoryMock: Partial<JobRepository>;

  beforeEach(async () => {
    // Criar um mock do JobRepository
    jobRepositoryMock = {
      aggregate: jest.fn().mockResolvedValue([]),
      findTemplates: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetjobTemplatesService,
        {
          provide: JobRepository,
          useValue: jobRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<GetjobTemplatesService>(GetjobTemplatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call jobRepository.aggregate with correct pipeline', async () => {
    const companyId = 'test-company-id';
    await service.execute(companyId);

    expect(jobRepositoryMock.aggregate).toHaveBeenCalled();
    const callArgs = (jobRepositoryMock.aggregate as jest.Mock).mock
      .calls[0][0];
    expect(callArgs[0].$match).toEqual({
      companyId,
      isTemplate: true,
    });
  });
});
