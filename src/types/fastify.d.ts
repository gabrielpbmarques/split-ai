import { FastifyRequest } from 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      workerId?: string;
      establishmentId?: string;
      companyId?: string;
      type: 'worker' | 'establishment' | 'company';
    };
  }
}
