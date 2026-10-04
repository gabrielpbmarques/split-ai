import { PrincipalResolverService } from './principal-resolver.service';

jest.mock('src/shared/config/env', () => ({
  env: { BRAVOHUB_ORG_ID: 'bravohub-org', AUTH_PRINCIPAL_CACHE_TTL_MS: 60_000 },
}));

describe('PrincipalResolverService', () => {
  const organizationRepository = { findById: jest.fn() };
  let resolver: PrincipalResolverService;

  beforeEach(() => {
    jest.clearAllMocks();
    resolver = new PrincipalResolverService(organizationRepository as any);
  });

  it('builds the user from the JWT payload and loads the organization status', async () => {
    organizationRepository.findById.mockResolvedValue({ status: 'inactive' });

    const user = await resolver.resolve({
      kind: 'user',
      payload: {
        sub: 'u1',
        role: 'user',
        org_role: 'owner',
        organization_id: 'org-1',
        email: 'a@b.c',
      },
    });

    expect(user).toMatchObject({
      kind: 'user',
      id: 'u1',
      role: 'user',
      org_role: 'owner',
      organization_id: 'org-1',
      organization_status: 'inactive',
    });
    expect(user.permissions).toContain('api-key.manage');
  });

  it('defaults org_role to member and keeps an empty organization id as empty string', async () => {
    const user = await resolver.resolve({
      kind: 'user',
      payload: { sub: 'u2', role: 'guest' },
    });

    expect(user.org_role).toBe('member');
    expect(user.organization_id).toBe('');
    expect(user.organization_status).toBeNull();
    expect(organizationRepository.findById).not.toHaveBeenCalled();
  });

  it('caches the organization status until invalidated', async () => {
    organizationRepository.findById.mockResolvedValue({ status: 'active' });
    const principal = {
      kind: 'user' as const,
      payload: { sub: 'u1', role: 'user' as const, organization_id: 'org-1' },
    };

    await resolver.resolve(principal);
    await resolver.resolve(principal);
    expect(organizationRepository.findById).toHaveBeenCalledTimes(1);

    resolver.invalidateOrganization('org-1');
    await resolver.resolve(principal);
    expect(organizationRepository.findById).toHaveBeenCalledTimes(2);
  });

  it('maps a BravoHub claim to a service principal scoped to the BravoHub org', async () => {
    organizationRepository.findById.mockResolvedValue({ status: 'active' });

    const user = await resolver.resolve({
      kind: 'bravohub',
      claim: {
        user_id: 1,
        company_id: 7,
        user_email: 'x@y.z',
        user_role: 'r',
        user_status: 1,
      },
    });

    expect(user).toMatchObject({
      kind: 'bravohub',
      role: 'service',
      organization_id: 'bravohub-org',
      companyId: 7,
      permissions: ['chat.ask'],
    });
  });

  it('maps an API key to a service principal carrying key id and scopes', async () => {
    organizationRepository.findById.mockResolvedValue({ status: 'active' });

    const user = await resolver.resolve({
      kind: 'service',
      apiKey: { id: 'k1', organization_id: 'org-3', scopes: ['chat'] } as any,
    });

    expect(user).toMatchObject({
      role: 'service',
      organization_id: 'org-3',
      api_key_id: 'k1',
      scopes: ['chat'],
    });
  });

  it('uses the embed organization status without another lookup', async () => {
    const user = await resolver.resolve({
      kind: 'service',
      organization: { id: 'org-4', status: 'active' } as any,
    });

    expect(user.organization_status).toBe('active');
    expect(organizationRepository.findById).not.toHaveBeenCalled();
  });
});
