import type { AuthenticatedUser } from 'src/auth/authenticated-user';

export function scopedOrganizationId(
  user: AuthenticatedUser,
): string | undefined {
  return user.role !== 'admin' && user.organization_id
    ? user.organization_id
    : undefined;
}
