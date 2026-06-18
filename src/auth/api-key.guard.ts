import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiKeyRepository, OrganizationRepository } from 'src/repositories';
import { hashApiKey } from 'src/utils/apiKey';

/**
 * Authenticates server-to-server callers presenting `Authorization: ApiKey <token>`.
 *
 * Resolution order:
 * 1. A real secret API key from the `api_keys` table (hashed lookup, must not be
 *    revoked or expired) — the sanctioned programmatic credential.
 * 2. Fallback: an organization `chat_embed_token` (the publishable key embedded
 *    in the public chat widget). Kept for backward compatibility of the widget.
 *
 * Either way `request.user` is populated with a synthetic service-user carrying
 * the resolved `organization_id` and `role: 'service'`.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly apiKeyRepository: ApiKeyRepository,
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers?: Record<string, string | string[] | undefined>;
      user?: unknown;
    }>();
    const header = (request.headers?.authorization as string | undefined) ?? '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'ApiKey' || !token) {
      throw new UnauthorizedException('API key ausente');
    }

    // 1. Real secret API key.
    const apiKey = await this.apiKeyRepository.findValidByHash(
      hashApiKey(token),
    );
    if (apiKey) {
      this.apiKeyRepository.touchLastUsed(apiKey.id).catch(() => undefined);
      request.user = {
        id: null,
        organization_id: apiKey.organization_id,
        api_key_id: apiKey.id,
        scopes: apiKey.scopes,
        role: 'service',
        email: null,
        name: 'service',
      };
      return true;
    }

    // 2. Fallback: publishable widget embed token.
    const organization =
      await this.organizationRepository.findActiveByEmbedToken(token);
    if (organization) {
      request.user = {
        id: null,
        organization_id: organization.id,
        organization,
        role: 'service',
        email: null,
        name: 'service',
      };
      return true;
    }

    throw new UnauthorizedException('API key inválida');
  }
}
