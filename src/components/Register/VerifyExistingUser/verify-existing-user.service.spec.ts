import { Test, TestingModule } from '@nestjs/testing';
import { VerifyExistingUserService } from './verify-existing-user.service';
import { WorkerRepository } from 'src/repositories/Worker.repository';

describe('VerifyExistingUserService', () => {
  let service: VerifyExistingUserService;

  const mockWorkerRepository = {
    findByEmailOrCpf: jest.fn().mockResolvedValue(null),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerifyExistingUserService,
        { provide: WorkerRepository, useValue: mockWorkerRepository },
      ],
    }).compile();

    service = module.get<VerifyExistingUserService>(VerifyExistingUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
