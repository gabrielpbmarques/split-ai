import { UnauthorizedException } from '@nestjs/common';
import { sign } from 'jsonwebtoken';

import { TokenVerifier } from 'src/auth/token.verifier';
import { env } from 'src/shared/config/env';
import { hashApiKey } from 'src/shared/utils/api-key';

jest.mock('src/shared/config/env', () => ({
  env: { JWT_SECRET: 'native-secret', BRAVOHUB_JWT_SECRET: 'bravohub-secret' },
}));

describe('TokenVerifier', () => {
  const apiKeyRepository = {
    findValidByHash: jest.fn(),
    touchLastUsed: jest.fn().mockResolvedValue(undefined),
  };
  const organizationRepository = { findActiveByEmbedToken: jest.fn() };
  const verifier = new TokenVerifier(
    apiKeyRepository as any,
    organizationRepository as any,
  );

  beforeEach(() => jest.clearAllMocks());

  describe('bearer', () => {
    it('accepts a token signed with the native secret', async () => {
      const token = sign({ sub: 'user-1', role: 'user' }, env.JWT_SECRET);

      await expect(verifier.verify('bearer', token)).resolves.toEqual({
        kind: 'user',
        payload: expect.objectContaining({ sub: 'user-1', role: 'user' }),
      });
    });

    it('rejects an expired native token', async () => {
      const token = sign({ sub: 'user-1', role: 'user' }, env.JWT_SECRET, {
        expiresIn: -10,
      });

      await expect(verifier.verify('bearer', token)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('rejects a token with a forged signature', async () => {
      const token = sign({ sub: 'user-1', role: 'admin' }, 'other-secret');

      await expect(verifier.verify('bearer', token)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('accepts an active BravoHub HS512 token as a bravohub principal', async () => {
      const token = sign(
        {
          user: {
            user_id: 1,
            company_id: 42,
            user_email: 'a@b.c',
            user_role: 'x',
            user_status: 1,
          },
        },
        env.BRAVOHUB_JWT_SECRET ?? '',
        { algorithm: 'HS512' },
      );

      await expect(verifier.verify('bearer', token)).resolves.toEqual({
        kind: 'bravohub',
        claim: expect.objectContaining({ company_id: 42 }),
      });
    });

    it('rejects a BravoHub token for an inactive user', async () => {
      const token = sign(
        {
          user: {
            user_id: 1,
            company_id: 42,
            user_email: 'a@b.c',
            user_role: 'x',
            user_status: 0,
          },
        },
        env.BRAVOHUB_JWT_SECRET ?? '',
        { algorithm: 'HS512' },
      );

      await expect(verifier.verify('bearer', token)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });

  describe('apikey', () => {
    it('resolves a valid secret key by its hash and touches last_used_at', async () => {
      const apiKey = { id: 'key-1', organization_id: 'org-1', scopes: null };
      apiKeyRepository.findValidByHash.mockResolvedValue(apiKey);

      await expect(verifier.verify('apikey', 'sk_live_abc')).resolves.toEqual({
        kind: 'service',
        apiKey,
      });
      expect(apiKeyRepository.findValidByHash).toHaveBeenCalledWith(
        hashApiKey('sk_live_abc'),
      );
      expect(apiKeyRepository.touchLastUsed).toHaveBeenCalledWith('key-1');
    });

    it('falls back to the organization embed token', async () => {
      apiKeyRepository.findValidByHash.mockResolvedValue(null);
      const organization = { id: 'org-2', status: 'active' };
      organizationRepository.findActiveByEmbedToken.mockResolvedValue(
        organization,
      );

      await expect(verifier.verify('apikey', 'embed-token')).resolves.toEqual({
        kind: 'service',
        organization,
      });
    });

    it('rejects an unknown key', async () => {
      apiKeyRepository.findValidByHash.mockResolvedValue(null);
      organizationRepository.findActiveByEmbedToken.mockResolvedValue(null);

      await expect(verifier.verify('apikey', 'nope')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });
});
