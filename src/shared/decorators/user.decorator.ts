import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';

import type { AuthenticatedUser } from 'src/auth/authenticated-user';
import { requireUser } from 'src/auth/request-user';

export const User = createParamDecorator(
  (field: keyof AuthenticatedUser | undefined, context: ExecutionContext) => {
    const user = requireUser(
      context.switchToHttp().getRequest<FastifyRequest>(),
    );

    return field ? user[field] : user;
  },
);
