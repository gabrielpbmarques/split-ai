import { Injectable, UnauthorizedException } from '@nestjs/common';
import { verify } from 'jsonwebtoken';

import type {
  ApiKeyEntity,
  OrganizationEntity,
} from 'src/infrastructure/database/schema';
import { ApiKeyRepository } from 'src/modules/api-keys/repositories/api-key.repository';
import { OrganizationRepository } from 'src/modules/organizations/repositories/organization.repository';
import { env } from 'src/shared/config/env';
import type { OrgRole, UserRole } from 'src/shared/contracts';
import { hashApiKey } from 'src/shared/utils/api-key';

export interface UserTokenPayload {
  readonly sub: string;
  readonly name?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly role: UserRole;
  readonly org_role?: OrgRole;
  readonly organization_id?: string;
}

export interface BravohubUserClaim {
  readonly user_id: number;
  readonly company_id: number;
  readonly user_email: string;
  readonly user_role: string;
  readonly user_status: number;
}

export type Principal =
  | { readonly kind: 'user'; readonly payload: UserTokenPayload }
  | { readonly kind: 'bravohub'; readonly claim: BravohubUserClaim }
  | { readonly kind: 'service'; readonly apiKey: ApiKeyEntity }
  | { readonly kind: 'service'; readonly organization: OrganizationEntity };

export type AuthScheme = 'bearer' | 'apikey';

@Injectable()
export class TokenVerifier {
  constructor(
    private readonly apiKeyRepository: ApiKeyRepository,
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async verify(scheme: AuthScheme, token: string): Promise<Principal> {
    return scheme === 'bearer'
      ? this.verifyBearer(token)
      : this.verifyApiKey(token);
  }

  private verifyBearer(token: string): Principal {
    const payload = this.verifyNativeJwt(token);

    if (payload) {
      return { kind: 'user', payload };
    }

    const claim = this.verifyBravohubJwt(token);

    if (claim) {
      return { kind: 'bravohub', claim };
    }

    throw new UnauthorizedException('Token de acesso inválido ou expirado');
  }

  private async verifyApiKey(token: string): Promise<Principal> {
    const apiKey = await this.apiKeyRepository.findValidByHash(
      hashApiKey(token),
    );

    if (apiKey) {
      void this.apiKeyRepository
        .touchLastUsed(apiKey.id)
        .catch(() => undefined);
      return { kind: 'service', apiKey };
    }

    const organization =
      await this.organizationRepository.findActiveByEmbedToken(token);

    if (organization) {
      return { kind: 'service', organization };
    }

    throw new UnauthorizedException('API key inválida');
  }

  private verifyNativeJwt(token: string): UserTokenPayload | null {
    try {
      const payload = verify(token, env.JWT_SECRET);

      return typeof payload === 'object' && typeof payload.sub === 'string'
        ? (payload as unknown as UserTokenPayload)
        : null;
    } catch {
      return null;
    }
  }

  private verifyBravohubJwt(token: string): BravohubUserClaim | null {
    if (!env.BRAVOHUB_JWT_SECRET) {
      return null;
    }

    try {
      const payload = verify(token, env.BRAVOHUB_JWT_SECRET, {
        algorithms: ['HS512'],
      }) as { user?: BravohubUserClaim };
      const claim = payload?.user;

      if (!claim || typeof claim !== 'object') {
        return null;
      }

      return claim.user_status === 1 && claim.company_id != null ? claim : null;
    } catch {
      return null;
    }
  }
}
