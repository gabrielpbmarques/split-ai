import type { Permission } from 'src/auth/permissions';
import type { UserRole } from 'src/shared/contracts';

export interface AuthenticatedUser {
  readonly id: string;
  readonly name: string | null;
  readonly email: string | null;
  readonly phone: string | null;
  readonly role: UserRole;
  readonly permissions: readonly Permission[];
}
