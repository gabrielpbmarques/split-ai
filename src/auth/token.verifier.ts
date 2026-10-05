import { Injectable, UnauthorizedException } from '@nestjs/common';
import { verify } from 'jsonwebtoken';

import { env } from 'src/shared/config/env';
import type { UserRole } from 'src/shared/contracts';

export interface UserTokenPayload {
  readonly sub: string;
  readonly name?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly role: UserRole;
}

const USER_ROLES: readonly UserRole[] = ['admin', 'user', 'guest'];

@Injectable()
export class TokenVerifier {
  verify(token: string): UserTokenPayload {
    let payload: unknown;

    try {
      payload = verify(token, env.JWT_SECRET);
    } catch {
      throw new UnauthorizedException('Token de acesso inválido ou expirado');
    }

    if (!this.isUserTokenPayload(payload)) {
      throw new UnauthorizedException('Token de acesso inválido ou expirado');
    }

    return payload;
  }

  private isUserTokenPayload(payload: unknown): payload is UserTokenPayload {
    if (typeof payload !== 'object' || payload === null) {
      return false;
    }

    const { sub, role } = payload as Record<string, unknown>;

    return (
      typeof sub === 'string' &&
      typeof role === 'string' &&
      USER_ROLES.includes(role as UserRole)
    );
  }
}
