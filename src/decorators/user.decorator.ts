import { User as UserModel } from '@anthor/entities-types';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator para extrair o usuário autenticado da requisição
 * Este decorator deve ser usado em conjunto com o AuthGuard
 *
 * @example
 * @UseGuards(AuthGuard)
 * @Roles('admin', 'establishment')
 * async handle(@User() user: User) {
 *   // Acesso ao usuário autenticado
 * }
 */
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserModel => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
