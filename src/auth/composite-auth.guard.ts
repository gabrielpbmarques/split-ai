import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { ApiKeyGuard } from './api-key.guard';
import { AuthGuard } from './auth.guard';

/**
 * Dispatches authentication based on the `Authorization` header scheme.
 *
 * - `Authorization: Bearer <jwt>` → delegates to `AuthGuard` (JWT path).
 * - `Authorization: ApiKey <token>` → delegates to `ApiKeyGuard`, which looks
 *   up the organization by `chat_embed_token` and attaches a service-user
 *   carrying the resolved `organization_id` to `request.user`.
 *
 * Apply per-handler: `@UseGuards(CompositeAuthGuard)`. The handler module must
 * register both `AuthGuard` and `ApiKeyGuard` as providers.
 */
@Injectable()
export class CompositeAuthGuard implements CanActivate {
  constructor(
    private readonly authGuard: AuthGuard,
    private readonly apiKeyGuard: ApiKeyGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers?: Record<string, string | string[] | undefined>;
      user?: unknown;
    }>();
    const header = (request.headers?.authorization as string | undefined) ?? '';
    const [scheme] = header.split(' ');

    if (scheme === 'ApiKey') {
      return this.apiKeyGuard.canActivate(context);
    }

    if (scheme === 'Bearer' || scheme === '') {
      const result = this.authGuard.canActivate(context);
      if (typeof result === 'boolean') return result;
      if (result instanceof Promise) return result;
      return new Promise<boolean>((resolve, reject) => {
        result.subscribe({ next: resolve, error: reject });
      });
    }

    throw new UnauthorizedException('Esquema de autenticação não suportado');
  }
}
