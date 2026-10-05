import { effectivePermissions } from 'src/auth/permissions';

describe('effectivePermissions', () => {
  it('gives admins management permissions and everything staff has', () => {
    const permissions = effectivePermissions({ role: 'admin' });

    expect(permissions).toEqual(
      expect.arrayContaining([
        'agent.manage',
        'user.manage',
        'agent.read',
        'report.read',
        'chat.ask',
      ]),
    );
  });

  it('keeps regular users out of management', () => {
    const permissions = effectivePermissions({ role: 'user' });

    expect(permissions).toEqual(
      expect.arrayContaining(['agent.read', 'agent.write', 'source.read']),
    );
    expect(permissions).not.toContain('agent.manage');
    expect(permissions).not.toContain('user.manage');
  });

  it('restricts guests to account access and chat', () => {
    expect(effectivePermissions({ role: 'guest' })).toEqual([
      'account.access',
      'chat.ask',
      'chat.attend',
    ]);
  });
});
