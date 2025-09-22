import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { UserEntity } from '../../../entities';
import { OrganizationRepository, UserRepository } from '../../../repositories';

import { SignUpDto } from './sign-up.dto';
import { SignUpService } from './sign-up.service';

describe('SignUpService', () => {
  let service: SignUpService;

  // Mock repositories
  const mockUserRepository = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
  };

  const mockOrganizationRepository = {
    findByEmailDomain: jest.fn(),
  };

  const mockSendVerificationEmailService = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignUpService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: OrganizationRepository,
          useValue: mockOrganizationRepository,
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
    };

    it('should register a citizen successfully', async () => {
      // Mock user does not exist
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue({
        id: '1',
        email: mockSignUpDto.email,
      } as UserEntity);

      const result = await service.execute(mockSignUpDto);

      expect(result).toEqual({
        message: 'Registration successful! Your account is now active.',
      });
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        mockSignUpDto.email,
      );
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(
        mockOrganizationRepository.findByEmailDomain,
      ).not.toHaveBeenCalled();
      expect(mockSendVerificationEmailService.execute).not.toHaveBeenCalled();
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
