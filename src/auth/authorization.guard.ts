import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FastifyRequest } from 'fastify';

import {
  IS_PUBLIC_KEY,
  REQUIRED_PERMISSIONS_KEY,
  REQUIRE_ACTIVE_ORGANIZATION_KEY,
} from 'src/auth/auth.constants';
import { Permission } from 'src/auth/permissions';
import { requireUser } from 'src/auth/request-user';

export const INACTIVE_ORGANIZATION_MESSAGE =
  'Sua organização está inativa. Entre em contato com o administrador para renovar o plano ou adquirir créditos.';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    if (context.getType() !== 'http') {
      return true;
    }

    const targets = [context.getHandler(), context.getClass()];

    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets)) {
      return true;
    }

    const user = requireUser(
      context.switchToHttp().getRequest<FastifyRequest>(),
    );

    const levels = this.reflector
      .getAll<(Permission[] | undefined)[]>(REQUIRED_PERMISSIONS_KEY, targets)
      .filter(
        (level): level is Permission[] =>
          Array.isArray(level) && level.length > 0,
      );

    for (const level of levels) {
      if (level.every((permission) => !user.permissions.includes(permission))) {
        throw new ForbiddenException(
          'Permissão insuficiente para acessar este recurso',
        );
      }
    }

    const requiresActiveOrganization =
      this.reflector.getAllAndOverride<boolean>(
        REQUIRE_ACTIVE_ORGANIZATION_KEY,
        targets,
      );

    if (requiresActiveOrganization && user.organization_status === 'inactive') {
      throw new ForbiddenException(INACTIVE_ORGANIZATION_MESSAGE);
    }

    return true;
  }
}
