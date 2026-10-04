import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcryptjs';

import { GenerateTokenService } from 'src/modules/auth-flows/generate-token/generate-token.service';
import { LoginService } from 'src/modules/auth-flows/login/login.service';
import { UserRepository } from 'src/modules/users/repositories/user.repository';

describe('LoginService', () => {
  const userRepository = { findByEmail: jest.fn() };
  const generateTokenService = {
    execute: jest
      .fn()
      .mockResolvedValue({ token: 'jwt', expiresAt: new Date() }),
  };
  const service = new LoginService(
    userRepository as unknown as UserRepository,
    generateTokenService as unknown as GenerateTokenService,
  );
  const dto = { email: 'ana@example.com', password: 'secret' };

  beforeEach(() => jest.clearAllMocks());

  it('returns the user summary and a token for valid credentials', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: 'u1',
      name: 'Ana',
      email: dto.email,
      status: 'active',
      role: 'user',
      organization_id: 'org-1',
      phone: '',
      password_hash: await bcrypt.hash('secret', 4),
    });

    const result = await service.execute(dto);

    expect(result.token).toBe('jwt');
    expect(result.user).toEqual({
      id: 'u1',
      name: 'Ana',
      email: dto.email,
      organization_id: 'org-1',
      role: 'user',
      phone: '',
    });
  });

  it('rejects an unknown e-mail', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(service.execute(dto)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects a wrong password', async () => {
    userRepository.findByEmail.mockResolvedValue({
      status: 'active',
      password_hash: await bcrypt.hash('other', 4),
    });

    await expect(service.execute(dto)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(generateTokenService.execute).not.toHaveBeenCalled();
  });

  it('refuses an inactive account before checking the password', async () => {
    userRepository.findByEmail.mockResolvedValue({ status: 'pending' });

    await expect(service.execute(dto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
