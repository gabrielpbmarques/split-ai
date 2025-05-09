import { Test, TestingModule } from '@nestjs/testing';
import { GetjobTemplatesService } from './getjob-templates.service';

describe('GetjobTemplatesService', () => {
  let service: GetjobTemplatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GetjobTemplatesService],
    }).compile();

    service = module.get<GetjobTemplatesService>(GetjobTemplatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
