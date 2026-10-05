import { Injectable } from '@nestjs/common';

import type { AuthenticatedUser } from 'src/auth/authenticated-user';
import { effectivePermissions } from 'src/auth/permissions';
import type { UserTokenPayload } from 'src/auth/token.verifier';

@Injectable()
export class PrincipalResolverService {
  resolve(payload: UserTokenPayload): AuthenticatedUser {
    return {
      id: payload.sub,
      name: payload.name ?? null,
      email: payload.email ?? null,
      phone: payload.phone ?? null,
      role: payload.role,
      permissions: effectivePermissions({ role: payload.role }),
    };
  }
}
