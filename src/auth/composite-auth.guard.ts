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
 * - `Authorization: ApiKey <key>` → delegates to `ApiKeyGuard`. Since the
 *   `ApiKeyGuard` does not attach a `request.user`, we synthesize a minimal
 *   service-user object so downstream code can branch on `user.organization_id`
 *   (which will be `null` for API-key callers — those must pass scope via the
 *   request DTO).
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
      const ok: boolean | Promise<boolean> =
        this.apiKeyGuard.canActivate(context);
      const allowed = await Promise.resolve(ok);
      if (!allowed) return false;
      // ApiKeyGuard does not populate `request.user`; downstream code expects
      // a stable shape, so synthesize a service-user placeholder. The
      // `organization_id` is intentionally `null` — API-key callers must
      // supply tenant scope via the DTO.
      request.user = {
        id: null,
        organization_id: null,
        role: 'service',
        email: null,
        name: 'service',
      };
      return true;
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
