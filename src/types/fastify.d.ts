import 'fastify';
import type { AuthenticatedUser } from 'src/auth/authenticated-user';

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}
