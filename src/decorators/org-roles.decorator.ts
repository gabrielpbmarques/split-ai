import { SetMetadata } from '@nestjs/common';
import { OrgRole } from 'src/types';

export const ORG_ROLES_KEY = 'org_roles';

/**
 * Restricts a handler to users holding one of the given organization roles
 * (owner/admin/member). Enforced by `OrgRoleGuard`, which must run after a
 * guard that populates `request.user.org_role` (e.g. `AuthGuard`).
 */
export const OrgRoles = (...roles: OrgRole[]) =>
  SetMetadata(ORG_ROLES_KEY, roles);
