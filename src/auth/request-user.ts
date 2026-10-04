import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';

import type { AuthenticatedUser } from 'src/auth/authenticated-user';

export function requireUser(request: FastifyRequest): AuthenticatedUser {
  if (!request.user) {
    throw new UnauthorizedException('Usuário não autenticado');
  }

  return request.user;
}

export function requireUserId(user: AuthenticatedUser): string {
  if (!user.id) {
    throw new ForbiddenException('Operação exige um usuário identificado');
  }

  return user.id;
}

export function requireOrganizationId(user: AuthenticatedUser): string {
  if (!user.organization_id) {
    throw new ForbiddenException('Operação exige uma organização ativa');
  }

  return user.organization_id;
}
