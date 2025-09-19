import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator para extrair o usuário autenticado da requisição
 * Este decorator deve ser usado em conjunto com o AuthGuard
 *
 * @example
 * @UseGuards(AuthGuard)
 * async handle(@User() user: User) {
 *   // Acesso ao usuário autenticado
 * }
 */
export const User = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext): any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (data && typeof data === 'string') {
      return user?.[data];
    }

    return user;
  },
);
