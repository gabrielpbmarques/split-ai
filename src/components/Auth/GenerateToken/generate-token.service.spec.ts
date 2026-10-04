import { Test, TestingModule } from '@nestjs/testing';
import { verify } from 'jsonwebtoken';
import { UserEntity } from 'src/entities/user.entity';
import { UserTokenRepository } from 'src/repositories/user-token.repository';
import { env } from 'src/shared/config/env';

import { GenerateTokenService } from './generate-token.service';

describe('GenerateTokenService', () => {
  let service: GenerateTokenService;
  let userTokenRepository: { createUniqueToken: jest.Mock };

  beforeEach(async () => {
    userTokenRepository = { createUniqueToken: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateTokenService,
        { provide: UserTokenRepository, useValue: userTokenRepository },
      ],
    }).compile();

    service = module.get<GenerateTokenService>(GenerateTokenService);
  });

  it('signs a token with the configured secret and persists it', async () => {
    const user = {
      id: 'user-1',
      name: 'Ana',
      email: 'ana@example.com',
      phone: '',
      role: 'user',
      organization_id: 'org-1',
      org_role: 'member',
    } as unknown as UserEntity;

    const { token, expiresAt } = await service.execute(user);
    const payload = verify(token, env.JWT_SECRET) as Record<string, unknown>;

    expect(payload.sub).toBe('user-1');
    expect(payload.organization_id).toBe('org-1');
    expect(payload.org_role).toBe('member');
    expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
    expect(userTokenRepository.createUniqueToken).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-1', token, status: 'active' }),
    );
  });

  it('omits organization claims for guest users', async () => {
    const user = {
      id: 'guest-1',
      role: 'guest',
      organization_id: 'org-1',
    } as unknown as UserEntity;

    const { token } = await service.execute(user);
    const payload = verify(token, env.JWT_SECRET) as Record<string, unknown>;

    expect(payload.organization_id).toBeUndefined();
    expect(payload.org_role).toBeUndefined();
  });

  it('returns null for a token signed with another secret', async () => {
    expect(await service.validateToken('not-a-token')).toBeNull();
  });
});
