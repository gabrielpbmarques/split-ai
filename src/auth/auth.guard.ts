import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { verify } from 'jsonwebtoken';
import { Observable } from 'rxjs';
import { env } from 'src/shared/config/env';

import { ROLES_KEY, UserRole } from '../decorators/roles.decorator';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const [, token] = request.headers.authorization?.split(' ') ?? [];

    if (!token) {
      throw new UnauthorizedException();
    }

    // Native split-ai token first. Only if it is NOT a valid native token do we
    // consider a forwarded BravoHub platform token (different secret + shape).
    let payload: any = null;
    try {
      payload = verifyJwt(token);
    } catch {
      payload = null;
    }

    if (!payload) {
      const claim = verifyBravohubJwt(token);
      if (!claim) {
        this.logger.warn(
          'Auth rejeitada (401): o token não validou como split-ai nem como BravoHub. Verifique BRAVOHUB_JWT_SECRET (== JWT_SECRET do bravohub), expiração do token, user_status=1 e company_id presente na claim.',
        );
        throw new UnauthorizedException();
      }
      // BravoHub dashboard user. `companyId` is a trusted, cryptographically
      // verified tenant scope — the ONLY source of company scoping, and it is
      // never read from the request body. Billed as a bundled platform feature
      // (`role: 'service'` ⇒ non-billable), attributed to the analytics org.
      request.user = {
        id: null,
        name: null,
        email: claim.user_email ?? null,
        role: 'service',
        org_role: 'member',
        document: '',
        document_type: '',
        organization_id: env.BRAVOHUB_ORG_ID ?? null,
        companyId: claim.company_id,
        birth_date: null,
        password_hash: '',
        phone: '',
        status: true,
        created_at: new Date(),
        updated_at: new Date(),
      };
      return true;
    }

    // Adaptar o payload do JWT para o formato esperado pelo modelo User
    request.user = {
      id: payload.sub, // O campo 'sub' do JWT contém o ID do usuário
      name: payload.name,
      email: payload.email,
      role: payload.role,
      org_role: payload.org_role || 'member',
      // Campos opcionais que podem não estar no JWT
      document: payload.document || '',
      document_type: payload.document_type || '',
      organization_id: payload.organization_id || '',
      birth_date: payload.birth_date ? new Date(payload.birth_date) : null,
      password_hash: '', // Não incluímos a senha no objeto de usuário
      phone: payload.phone || '',
      status: payload.status !== undefined ? payload.status : true,
      created_at: payload.created_at
        ? new Date(payload.created_at)
        : new Date(),
      updated_at: payload.updated_at
        ? new Date(payload.updated_at)
        : new Date(),
    };

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const userRole = payload.role as UserRole;

    if (!requiredRoles.includes(userRole)) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}

/**
 * Verifies the JWT signature and expiry using `JWT_SECRET`, returning the
 * decoded payload. Any malformed, tampered, or expired token is rejected.
 */
export function verifyJwt(token: string): any {
  try {
    return verify(token, env.JWT_SECRET);
  } catch {
    throw new UnauthorizedException();
  }
}

/**
 * BravoHub dashboard JWT claim (nested under `user`). Signed HS512 with
 * bravohub-api's `JWT_SECRET`, surfaced to split-ai as `BRAVOHUB_JWT_SECRET`.
 */
export type BravohubUserClaim = {
  user_id: number;
  company_id: number;
  user_email: string;
  user_role: string;
  user_status: number;
};

/**
 * Verifies a forwarded BravoHub platform token and returns its `user` claim, or
 * `null` when the bridge is disabled (no `BRAVOHUB_JWT_SECRET`), the signature
 * fails, or the user is not active. A `null` return lets the caller fall back to
 * rejecting the request — a forged token can never pass `verify`, so a returned
 * claim is always trustworthy as the tenant scope.
 */
export function verifyBravohubJwt(token: string): BravohubUserClaim | null {
  const secret = env.BRAVOHUB_JWT_SECRET;
  if (!secret) {
    return null;
  }
  try {
    const payload = verify(token, secret, { algorithms: ['HS512'] }) as {
      user?: BravohubUserClaim;
    };
    const claim = payload?.user;
    if (!claim || typeof claim !== 'object') {
      return null;
    }
    if (claim.user_status !== 1 || claim.company_id == null) {
      return null;
    }
    return claim;
  } catch {
    return null;
  }
}
