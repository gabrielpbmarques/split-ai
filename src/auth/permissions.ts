import type { UserRole } from 'src/shared/contracts';

export interface PermissionSubject {
  readonly role: UserRole;
}

type Grant = (subject: PermissionSubject) => boolean;

const staff: Grant = ({ role }) => role === 'admin' || role === 'user';
const admin: Grant = ({ role }) => role === 'admin';
const everyone: Grant = () => true;

export const PERMISSION_GRANTS = {
  'account.access': everyone,
  'chat.ask': everyone,
  'chat.attend': everyone,
  'voice.synthesize': staff,
  'analytics.read': staff,
  'agent.read': staff,
  'agent.write': staff,
  'agent.manage': admin,
  'agent-connection.manage': staff,
  'source.read': staff,
  'source.write': staff,
  'session.read': staff,
  'report.read': staff,
  'user.read': staff,
  'user.manage': admin,
} as const satisfies Record<string, Grant>;

export type Permission = keyof typeof PERMISSION_GRANTS;

export const PERMISSIONS = Object.keys(PERMISSION_GRANTS) as Permission[];

export function effectivePermissions(subject: PermissionSubject): Permission[] {
  return PERMISSIONS.filter((permission) =>
    PERMISSION_GRANTS[permission](subject),
  );
}
