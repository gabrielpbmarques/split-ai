import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { effectivePermissions } from 'src/auth/permissions';
import { Principal } from 'src/auth/token.verifier';
import { OrganizationRepository } from 'src/repositories/organization.repository';
import { env } from 'src/shared/config/env';
import { OrganizationStatus } from 'src/types';

interface CachedStatus {
  readonly status: OrganizationStatus | null;
  readonly expiresAt: number;
}

@Injectable()
export class PrincipalResolverService {
  private readonly organizationStatus = new Map<string, CachedStatus>();

  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async resolve(principal: Principal): Promise<AuthenticatedUser> {
    switch (principal.kind) {
      case 'user':
        return this.resolveUser(principal);
      case 'bravohub':
        return this.resolveBravohub(principal);
      case 'service':
        return this.resolveService(principal);
    }
  }

  invalidateOrganization(organizationId: string): void {
    this.organizationStatus.delete(organizationId);
  }

  private async resolveUser(
    principal: Extract<Principal, { kind: 'user' }>,
  ): Promise<AuthenticatedUser> {
    const { payload } = principal;
    const organizationId = payload.organization_id || '';
    const orgRole = payload.org_role ?? 'member';

    return {
      kind: 'user',
      id: payload.sub,
      name: payload.name ?? null,
      email: payload.email ?? null,
      phone: payload.phone ?? null,
      role: payload.role,
      org_role: orgRole,
      organization_id: organizationId,
      organization_status: await this.statusOf(organizationId),
      permissions: effectivePermissions({
        role: payload.role,
        org_role: orgRole,
      }),
    };
  }

  private async resolveBravohub(
    principal: Extract<Principal, { kind: 'bravohub' }>,
  ): Promise<AuthenticatedUser> {
    const organizationId = env.BRAVOHUB_ORG_ID ?? null;

    return {
      kind: 'bravohub',
      id: null,
      name: null,
      email: principal.claim.user_email ?? null,
      phone: null,
      role: 'service',
      org_role: 'member',
      organization_id: organizationId,
      organization_status: await this.statusOf(organizationId),
      companyId: principal.claim.company_id,
      permissions: effectivePermissions({
        role: 'service',
        org_role: 'member',
      }),
    };
  }

  private async resolveService(
    principal: Extract<Principal, { kind: 'service' }>,
  ): Promise<AuthenticatedUser> {
    const base = {
      kind: 'service' as const,
      id: null,
      name: 'service',
      email: null,
      phone: null,
      role: 'service' as const,
      org_role: 'member' as const,
      permissions: effectivePermissions({
        role: 'service',
        org_role: 'member',
      }),
    };

    if ('apiKey' in principal) {
      return {
        ...base,
        organization_id: principal.apiKey.organization_id,
        organization_status: await this.statusOf(
          principal.apiKey.organization_id,
        ),
        api_key_id: principal.apiKey.id,
        scopes: principal.apiKey.scopes,
      };
    }

    return {
      ...base,
      organization_id: principal.organization.id,
      organization_status: principal.organization.status,
    };
  }

  private async statusOf(
    organizationId: string | null,
  ): Promise<OrganizationStatus | null> {
    if (!organizationId) {
      return null;
    }

    const cached = this.organizationStatus.get(organizationId);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.status;
    }

    const organization =
      await this.organizationRepository.findById(organizationId);
    const status = organization?.status ?? null;

    this.organizationStatus.set(organizationId, {
      status,
      expiresAt: Date.now() + env.AUTH_PRINCIPAL_CACHE_TTL_MS,
    });

    return status;
  }
}
