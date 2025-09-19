// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FastifyRequest } from 'fastify';
import { UserRole } from 'src/types';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      workerId?: string;
      establishmentId?: string;
      companyId?: string;
      type: UserRole;
    };
  }
}
