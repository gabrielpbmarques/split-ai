import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { config } from 'src/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const expected = config.analyticsAskApiKey;
    if (!expected) {
      throw new UnauthorizedException('Serviço não configurado');
    }
    const request = context.switchToHttp().getRequest<{
      headers?: Record<string, string | string[] | undefined>;
    }>();
    const header = (request.headers?.authorization as string | undefined) ?? '';
    const [scheme, value] = header.split(' ');
    if (scheme !== 'ApiKey' || !value) {
      throw new UnauthorizedException('API key ausente');
    }
    if (!this.timingSafeEqual(value, expected)) {
      throw new UnauthorizedException('API key inválida');
    }
    return true;
  }

  private timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
      diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return diff === 0;
  }
}
