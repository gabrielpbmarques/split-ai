import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { requireUser } from 'src/auth/request-user';

export const User = createParamDecorator(
  (field: keyof AuthenticatedUser | undefined, context: ExecutionContext) => {
    const user = requireUser(
      context.switchToHttp().getRequest<FastifyRequest>(),
    );

    return field ? user[field] : user;
  },
);
