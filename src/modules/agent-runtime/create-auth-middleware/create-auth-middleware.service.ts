import { Injectable } from '@nestjs/common';
import { type AnyAgentMiddleware, createMiddleware, tool } from 'langchain';
import { z } from 'zod';

import type { AuthenticatedUser } from 'src/auth/authenticated-user';
import { PrincipalResolverService } from 'src/auth/principal-resolver.service';
import { TokenVerifier } from 'src/auth/token.verifier';

export interface JwtVerificationResult {
  readonly authenticated: boolean;
  readonly user?: AuthenticatedUser;
  readonly error?: string;
}

@Injectable()
export class CreateAuthMiddlewareService {
  constructor(
    private readonly tokenVerifier: TokenVerifier,
    private readonly principalResolver: PrincipalResolverService,
  ) {}

  execute(promptVariables?: Record<string, unknown>): AnyAgentMiddleware {
    const rawAuthorization =
      typeof promptVariables?.authorization === 'string'
        ? promptVariables.authorization
        : undefined;

    const verifyJwtTool = tool(
      async ({ token }: { token?: string }) => {
        const result = this.verifyAuthorization(token ?? rawAuthorization);
        return JSON.stringify(result);
      },
      {
        name: 'verify_jwt',
        description:
          'Verifica a autenticidade e a assinatura criptográfica do token JWT da requisição atual (ou de um token informado) para confirmar a identidade do usuário.',
        schema: z.object({
          token: z
            .string()
            .optional()
            .describe(
              'Token JWT ou cabeçalho Authorization opcional. Se omitido, utiliza o token recebido nas variáveis da requisição atual.',
            ),
        }),
      },
    );

    return createMiddleware({
      name: 'JwtAuthenticationMiddleware',
      tools: [verifyJwtTool],
      wrapModelCall: async (request, handler) => {
        const verification = this.verifyAuthorization(rawAuthorization);
        const authPrompt = this.renderVerificationPrompt(verification);
        const systemMessage = request.systemMessage.concat(`\n\n${authPrompt}`);

        return handler({
          ...request,
          systemMessage,
        });
      },
    });
  }

  verifyAuthorization(
    authorization: string | undefined,
  ): JwtVerificationResult {
    if (!authorization) {
      return {
        authenticated: false,
        error: 'Token de acesso ausente',
      };
    }

    const trimmed = authorization.trim();
    const parts = trimmed.split(/\s+/);
    const token =
      parts.length > 1 && parts[0].toLowerCase() === 'bearer'
        ? parts.slice(1).join(' ').trim()
        : trimmed;

    if (!token) {
      return {
        authenticated: false,
        error: 'Token de acesso ausente',
      };
    }

    try {
      const payload = this.tokenVerifier.verify(token);
      const user = this.principalResolver.resolve(payload);

      return {
        authenticated: true,
        user,
      };
    } catch (error) {
      return {
        authenticated: false,
        error:
          error instanceof Error
            ? error.message
            : 'Token de acesso inválido ou expirado',
      };
    }
  }

  private renderVerificationPrompt(result: JwtVerificationResult): string {
    if (!result.authenticated || !result.user) {
      return [
        '## Verificação de Autenticação JWT (Middleware)',
        'authenticated: false',
        `error: ${result.error ?? 'Não autenticado'}`,
      ].join('\n');
    }

    const { user } = result;
    const lines = [
      '## Verificação de Autenticação JWT (Middleware)',
      'authenticated: true',
      `userId: ${user.id}`,
      user.name ? `userName: ${user.name}` : undefined,
      user.email ? `userEmail: ${user.email}` : undefined,
      user.phone ? `userPhone: ${user.phone}` : undefined,
      `userRole: ${user.role}`,
      `permissions: ${user.permissions.join(', ')}`,
    ].filter((line): line is string => Boolean(line));

    return lines.join('\n');
  }
}
