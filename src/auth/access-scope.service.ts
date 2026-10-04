import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { Permission } from 'src/auth/permissions';

export interface OrganizationScope {
  readonly organizationId: string | null | undefined;
}

const DEFAULT_MESSAGE = 'Você não tem acesso a este recurso.';

@Injectable()
export class AccessScopeService {
  can(
    user: AuthenticatedUser,
    permission: Permission,
    scope: OrganizationScope,
  ): boolean {
    if (!user.permissions.includes(permission)) {
      return false;
    }

    if (user.role === 'admin') {
      return true;
    }

    return (
      Boolean(scope.organizationId) &&
      scope.organizationId === user.organization_id
    );
  }

  ensureCan(
    user: AuthenticatedUser,
    permission: Permission,
    scope: OrganizationScope,
    message: string = DEFAULT_MESSAGE,
  ): void {
    if (!this.can(user, permission, scope)) {
      throw new ForbiddenException(message);
    }
  }
}
