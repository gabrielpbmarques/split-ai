import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';

import { IS_PUBLIC_KEY } from 'src/auth/auth.constants';
import { PrincipalResolverService } from 'src/auth/principal-resolver.service';
import { TokenVerifier } from 'src/auth/token.verifier';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenVerifier: TokenVerifier,
    private readonly principalResolver: PrincipalResolverService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    if (context.getType() !== 'http') {
      return true;
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const { scheme, token } = this.parseAuthorization(
      request.headers.authorization,
    );

    if (!token) {
      throw new UnauthorizedException('Token de acesso ausente');
    }

    if (scheme !== 'bearer') {
      throw new UnauthorizedException('Esquema de autenticação não suportado');
    }

    const payload = this.tokenVerifier.verify(token);
    request.user = this.principalResolver.resolve(payload);

    return true;
  }

  private parseAuthorization(header: string | undefined): {
    scheme?: string;
    token?: string;
  } {
    if (!header) {
      return {};
    }

    const [rawScheme, ...rest] = header.trim().split(/\s+/);
    const token = rest.join(' ').trim() || undefined;

    return { scheme: rawScheme.toLowerCase(), token };
  }
}
