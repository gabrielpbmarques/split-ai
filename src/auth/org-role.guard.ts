import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ORG_ROLES_KEY } from 'src/decorators/org-roles.decorator';
import { OrgRole } from 'src/types';

/**
 * Authorizes a request against the organization role required by `@OrgRoles`.
 * Runs after `AuthGuard` (which sets `request.user.org_role`). When a handler
 * declares no `@OrgRoles`, access is allowed.
 */
@Injectable()
export class OrgRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<OrgRole[]>(
      ORG_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const orgRole = request.user?.org_role as OrgRole | undefined;

    if (!orgRole || !requiredRoles.includes(orgRole)) {
      throw new ForbiddenException(
        'Você não tem permissão para esta ação na organização.',
      );
    }

    return true;
  }
}
