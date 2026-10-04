import { effectivePermissions } from 'src/auth/permissions';

describe('effectivePermissions', () => {
  it('gives platform admins management permissions and everything staff has', () => {
    const permissions = effectivePermissions({
      role: 'admin',
      org_role: 'member',
    });

    expect(permissions).toEqual(
      expect.arrayContaining([
        'agent.manage',
        'organization.manage',
        'user.manage',
        'agent.read',
        'report.read',
        'chat.ask',
      ]),
    );
    expect(permissions).not.toContain('api-key.manage');
  });

  it('keeps regular users out of platform management', () => {
    const permissions = effectivePermissions({
      role: 'user',
      org_role: 'member',
    });

    expect(permissions).toEqual(
      expect.arrayContaining(['agent.read', 'agent.write', 'source.read']),
    );
    expect(permissions).not.toContain('agent.manage');
    expect(permissions).not.toContain('organization.manage');
  });

  it('grants organization management only to owners and admins of the org', () => {
    expect(effectivePermissions({ role: 'user', org_role: 'owner' })).toEqual(
      expect.arrayContaining(['api-key.manage', 'member.manage']),
    );
    expect(
      effectivePermissions({ role: 'user', org_role: 'member' }),
    ).not.toContain('member.manage');
  });

  it('restricts guests to account access and chat', () => {
    const permissions = effectivePermissions({
      role: 'guest',
      org_role: 'member',
    });

    expect(permissions).toEqual(
      expect.arrayContaining(['account.access', 'chat.ask', 'chat.attend']),
    );
    expect(permissions).not.toContain('agent.read');
  });

  it('restricts service principals to the chat entry point', () => {
    expect(
      effectivePermissions({ role: 'service', org_role: 'member' }),
    ).toEqual(['chat.ask']);
  });
});
