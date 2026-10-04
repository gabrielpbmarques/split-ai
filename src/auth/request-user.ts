import { UnauthorizedException } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { AuthenticatedUser } from 'src/auth/authenticated-user';

export function requireUser(request: FastifyRequest): AuthenticatedUser {
  if (!request.user) {
    throw new UnauthorizedException('Usuário não autenticado');
  }

  return request.user;
}
