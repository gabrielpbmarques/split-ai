import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const [_, token] = request.headers.authorization?.split(' ') ?? [];

    if (!token) {
      throw new UnauthorizedException();
    }

    const payload = parseJwt(token);
    request.user = payload;

    const url = request.url;
    const userType = payload.userType;

    if (url.startsWith('/validate-token') && userType !== 'worker') {
      throw new ForbiddenException('Only workers can access this endpoint');
    }

    if (
      url.startsWith('/token') &&
      userType !== 'establishment' &&
      userType !== 'company'
    ) {
      throw new ForbiddenException(
        'Only establishments and companies can access this endpoint',
      );
    }

    return true;
  }
}

export function parseJwt(token: string): any {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  } catch {
    throw new UnauthorizedException();
  }
}
