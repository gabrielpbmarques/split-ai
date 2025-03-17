import { FastifyRequest } from 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      workerId?: string;
      type: 'worker' | 'establishment' | 'company';
    };
  }
}
