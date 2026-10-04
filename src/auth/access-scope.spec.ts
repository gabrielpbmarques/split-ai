import { ForbiddenException } from '@nestjs/common';

import { AccessScopeService } from 'src/auth/access-scope.service';
import type { AuthenticatedUser } from 'src/auth/authenticated-user';
import { effectivePermissions } from 'src/auth/permissions';

const userOf = (
  role: AuthenticatedUser['role'],
  organizationId: string | null,
): AuthenticatedUser => ({
  kind: 'user',
  id: 'u1',
  name: null,
  email: null,
  phone: null,
  role,
  org_role: 'member',
  organization_id: organizationId,
  organization_status: 'active',
  permissions: effectivePermissions({ role, org_role: 'member' }),
});

describe('AccessScopeService', () => {
  const service = new AccessScopeService();

  it('allows a user to reach resources of their own organization', () => {
    expect(
      service.can(userOf('user', 'org-1'), 'agent.read', {
        organizationId: 'org-1',
      }),
    ).toBe(true);
  });

  it('denies resources of another organization', () => {
    expect(
      service.can(userOf('user', 'org-1'), 'agent.read', {
        organizationId: 'org-2',
      }),
    ).toBe(false);
  });

  it('denies resources without an organization to users that are not platform admins', () => {
    expect(
      service.can(userOf('user', ''), 'agent.read', { organizationId: null }),
    ).toBe(false);
  });

  it('lets platform admins reach any organization', () => {
    expect(
      service.can(userOf('admin', 'org-1'), 'agent.read', {
        organizationId: 'org-9',
      }),
    ).toBe(true);
  });

  it('denies when the permission itself is missing', () => {
    expect(
      service.can(userOf('guest', 'org-1'), 'agent.read', {
        organizationId: 'org-1',
      }),
    ).toBe(false);
  });

  it('throws ForbiddenException with the given message on ensureCan', () => {
    expect(() =>
      service.ensureCan(
        userOf('user', 'org-1'),
        'agent.read',
        { organizationId: 'org-2' },
        'Você não tem acesso a este agente.',
      ),
    ).toThrow(new ForbiddenException('Você não tem acesso a este agente.'));
  });
});
