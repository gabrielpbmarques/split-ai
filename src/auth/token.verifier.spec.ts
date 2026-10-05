import { UnauthorizedException } from '@nestjs/common';
import { sign } from 'jsonwebtoken';

import { TokenVerifier } from 'src/auth/token.verifier';
import { env } from 'src/shared/config/env';

jest.mock('src/shared/config/env', () => ({
  env: { JWT_SECRET: 'native-secret' },
}));

describe('TokenVerifier', () => {
  const verifier = new TokenVerifier();

  it('accepts a token signed with the native secret', () => {
    const token = sign({ sub: 'user-1', role: 'user' }, env.JWT_SECRET);

    expect(verifier.verify(token)).toEqual(
      expect.objectContaining({ sub: 'user-1', role: 'user' }),
    );
  });

  it('rejects an expired token', () => {
    const token = sign({ sub: 'user-1', role: 'user' }, env.JWT_SECRET, {
      expiresIn: -10,
    });

    expect(() => verifier.verify(token)).toThrow(UnauthorizedException);
  });

  it('rejects a token with a forged signature', () => {
    const token = sign({ sub: 'user-1', role: 'admin' }, 'other-secret');

    expect(() => verifier.verify(token)).toThrow(UnauthorizedException);
  });

  it('rejects a token without a subject', () => {
    const token = sign({ role: 'admin' }, env.JWT_SECRET);

    expect(() => verifier.verify(token)).toThrow(UnauthorizedException);
  });

  it('rejects a token with an unknown role', () => {
    const token = sign({ sub: 'user-1', role: 'service' }, env.JWT_SECRET);

    expect(() => verifier.verify(token)).toThrow(UnauthorizedException);
  });
});
