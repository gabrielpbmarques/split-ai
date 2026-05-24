import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { OrganizationRepository } from 'src/repositories';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
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

    const organization =
      await this.organizationRepository.findActiveByEmbedToken(token);
    if (!organization) {
      throw new UnauthorizedException('API key inválida');
    }

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
}
