import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserService } from './create-user.service';
import { UserRepository } from 'src/repositories/User.repository';
import { WorkerRepository } from 'src/repositories/Worker.repository';

describe('CreateUserService', () => {
  let service: CreateUserService;

  const mockUserRepository = {
    create: jest.fn().mockResolvedValue({ _id: '123' }),
    findById: jest.fn().mockResolvedValue(null),
  };

  const mockWorkerRepository = {
    update: jest.fn().mockResolvedValue({}),
    findById: jest.fn().mockResolvedValue(null),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: WorkerRepository, useValue: mockWorkerRepository },
      ],
    }).compile();

    service = module.get<CreateUserService>(CreateUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
