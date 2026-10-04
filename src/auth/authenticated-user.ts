import type { Permission, PrincipalRole } from 'src/auth/permissions';
import type { OrgRole, OrganizationStatus } from 'src/shared/contracts';

export type PrincipalKind = 'user' | 'service' | 'bravohub';

export interface AuthenticatedUser {
  readonly kind: PrincipalKind;
  readonly id: string | null;
  readonly name: string | null;
  readonly email: string | null;
  readonly phone: string | null;
  readonly role: PrincipalRole;
  readonly org_role: OrgRole;
  readonly organization_id: string | null;
  readonly organization_status: OrganizationStatus | null;
  readonly companyId?: string | number | null;
  readonly api_key_id?: string;
  readonly scopes?: string[] | null;
  readonly permissions: readonly Permission[];
}
