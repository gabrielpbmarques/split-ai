import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUserService } from 'src/components/UserManagement/UpdateUser/update-user.service';
import { UserRepository } from 'src/repositories/User.repository';

describe('UpdateUserService', () => {
  let service: UpdateUserService;

  const mockUserRepository = {
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    findById: jest.fn().mockResolvedValue(null),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserService,
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<UpdateUserService>(UpdateUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
