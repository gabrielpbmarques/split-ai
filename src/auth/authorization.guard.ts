import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';

import {
  IS_PUBLIC_KEY,
  REQUIRED_PERMISSIONS_KEY,
} from 'src/auth/auth.constants';
import type { Permission } from 'src/auth/permissions';
import { requireUser } from 'src/auth/request-user';

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

    return true;
  }
}
