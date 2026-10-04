import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FastifyRequest } from 'fastify';

import { IS_PUBLIC_KEY } from 'src/auth/auth.constants';
import { PrincipalResolverService } from 'src/auth/principal-resolver.service';
import { AuthScheme, TokenVerifier } from 'src/auth/token.verifier';

const SCHEMES: Record<string, AuthScheme> = {
  bearer: 'bearer',
  apikey: 'apikey',
};

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenVerifier: TokenVerifier,
    private readonly principalResolver: PrincipalResolverService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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

    if (!scheme) {
      throw new UnauthorizedException('Esquema de autenticação não suportado');
    }

    const principal = await this.tokenVerifier.verify(scheme, token);
    request.user = await this.principalResolver.resolve(principal);

    return true;
  }

  private parseAuthorization(header: string | undefined): {
    scheme?: AuthScheme;
    token?: string;
  } {
    if (!header) {
      return {};
    }

    const [rawScheme, ...rest] = header.trim().split(/\s+/);
    const token = rest.join(' ').trim() || undefined;

    return { scheme: SCHEMES[rawScheme.toLowerCase()], token };
  }
}
