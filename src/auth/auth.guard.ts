import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
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

    if (url.startsWith('/token') && userType !== 'establishment' && userType !== 'company') {
      throw new ForbiddenException('Only establishments and companies can access this endpoint');
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
