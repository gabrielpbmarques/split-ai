import { OrgRole, UserRole } from 'src/shared/contracts';

export type PrincipalRole = UserRole | 'service';

export interface PermissionSubject {
  readonly role: PrincipalRole;
  readonly org_role: OrgRole;
}

type Grant = (subject: PermissionSubject) => boolean;

const platformStaff: Grant = ({ role }) => role === 'admin' || role === 'user';
const platformAdmin: Grant = ({ role }) => role === 'admin';
const anyUser: Grant = ({ role }) => role !== 'service';
const orgManager: Grant = ({ org_role }) =>
  org_role === 'owner' || org_role === 'admin';
const everyone: Grant = () => true;

export const PERMISSION_GRANTS = {
  'account.access': anyUser,
  'chat.ask': everyone,
  'chat.attend': anyUser,
  'voice.synthesize': platformStaff,
  'analytics.read': platformStaff,
  'agent.read': platformStaff,
  'agent.write': platformStaff,
  'agent.manage': platformAdmin,
  'agent-connection.manage': platformStaff,
  'source.read': platformStaff,
  'source.write': platformStaff,
  'session.read': platformStaff,
  'report.read': platformStaff,
  'organization.read': platformStaff,
  'organization.manage': platformAdmin,
  'member.manage': orgManager,
  'api-key.manage': orgManager,
  'user.read': platformStaff,
  'user.manage': platformAdmin,
} as const satisfies Record<string, Grant>;

export type Permission = keyof typeof PERMISSION_GRANTS;

export const PERMISSIONS = Object.keys(PERMISSION_GRANTS) as Permission[];

export function effectivePermissions(subject: PermissionSubject): Permission[] {
  return PERMISSIONS.filter((permission) =>
    PERMISSION_GRANTS[permission](subject),
  );
}
