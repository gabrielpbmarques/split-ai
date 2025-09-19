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

import { ROLES_KEY, UserRole } from '../decorators/roles.decorator';

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, token] = request.headers.authorization?.split(' ') ?? [];

    if (!token) {
      throw new UnauthorizedException();
    }

    const payload = parseJwt(token);

    // Adaptar o payload do JWT para o formato esperado pelo modelo User
    request.user = {
      id: payload.sub, // O campo 'sub' do JWT contém o ID do usuário
      name: payload.name,
      email: payload.email,
      role: payload.role,
      // Campos opcionais que podem não estar no JWT
      document: payload.document || '',
      document_type: payload.document_type || '',
      organization_id: payload.organization_id || '',
      birth_date: payload.birth_date ? new Date(payload.birth_date) : null,
      password_hash: '', // Não incluímos a senha no objeto de usuário
      phone: payload.phone || '',
      status: payload.status !== undefined ? payload.status : true,
      created_at: payload.created_at
        ? new Date(payload.created_at)
        : new Date(),
      updated_at: payload.updated_at
        ? new Date(payload.updated_at)
        : new Date(),
    };

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const userRole = payload.role as UserRole;

    if (!requiredRoles.includes(userRole)) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}`,
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
