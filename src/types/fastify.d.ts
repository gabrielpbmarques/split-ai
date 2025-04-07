import { FastifyRequest } from 'fastify';
import { UserType } from '../models/user.model';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      workerId?: string;
      establishmentId?: string;
      companyId?: string;
      type: UserType;
    };
  }
}
