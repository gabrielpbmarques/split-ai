import 'fastify';
import { AuthenticatedUser } from 'src/auth/authenticated-user';

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}
