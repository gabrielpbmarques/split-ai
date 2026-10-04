import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { UserEntity } from 'src/infrastructure/database/schema';
import { SignUpDto } from 'src/modules/auth-flows/sign-up/sign-up.dto';
import { SignUpService } from 'src/modules/auth-flows/sign-up/sign-up.service';
import { UserRepository } from 'src/modules/users/repositories/user.repository';

describe('SignUpService', () => {
  let service: SignUpService;

  // Mock repositories
  const mockUserRepository = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignUpService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<SignUpService>(SignUpService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    const mockSignUpDto: SignUpDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      phone: '11999999999',
      organization: '1',
    };

    it('registers an active user when the e-mail is free', async () => {
      // Mock user does not exist
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue({
        id: '1',
        email: mockSignUpDto.email,
      } as UserEntity);

      const result = await service.execute(mockSignUpDto);

      expect(result).toMatchObject({
        message: expect.stringContaining('Cadastro realizado com sucesso'),
        user: { id: '1', email: mockSignUpDto.email },
      });
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        mockSignUpDto.email,
      );
      expect(mockUserRepository.create).toHaveBeenCalled();
    });

    it('should throw if passwords do not match', async () => {
      const invalidDto = {
        ...mockSignUpDto,
        confirmPassword: 'differentPassword',
      };

      await expect(service.execute(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if email is already registered', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({
        id: '1',
        email: mockSignUpDto.email,
      } as UserEntity);

      await expect(service.execute(mockSignUpDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
