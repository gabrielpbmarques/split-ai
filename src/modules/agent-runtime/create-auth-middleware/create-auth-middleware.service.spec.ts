import { SystemMessage } from '@langchain/core/messages';

import { PrincipalResolverService } from 'src/auth/principal-resolver.service';
import type { TokenVerifier } from 'src/auth/token.verifier';
import { CreateAuthMiddlewareService } from 'src/modules/agent-runtime/create-auth-middleware/create-auth-middleware.service';

describe('CreateAuthMiddlewareService', () => {
  const buildService = (verifyImpl?: jest.Mock) => {
    const tokenVerifier = {
      verify:
        verifyImpl ??
        jest.fn().mockReturnValue({
          sub: 'user-123',
          name: 'Gabriel',
          email: 'gabriel@example.com',
          phone: '+5511999999999',
          role: 'admin',
        }),
    } as unknown as TokenVerifier;

    const principalResolver = new PrincipalResolverService();
    const service = new CreateAuthMiddlewareService(
      tokenVerifier,
      principalResolver,
    );

    return { service, tokenVerifier };
  };

  it('valida o JWT no middleware (wrapModelCall) e na ferramenta verify_jwt do agente', async () => {
    const { service, tokenVerifier } = buildService();
    const middleware = service.execute({
      authorization: 'Bearer valid-jwt-token',
    });

    expect(middleware.name).toBe('JwtAuthenticationMiddleware');
    expect(middleware.tools).toHaveLength(1);
    expect(middleware.tools?.[0].name).toBe('verify_jwt');

    const toolOutput = await (
      middleware.tools?.[0] as unknown as {
        invoke: (input: Record<string, unknown>) => Promise<string>;
      }
    ).invoke({});
    const parsedTool = JSON.parse(toolOutput) as {
      authenticated: boolean;
      user: { id: string; name: string; role: string };
    };

    expect(tokenVerifier.verify).toHaveBeenCalledWith('valid-jwt-token');
    expect(parsedTool.authenticated).toBe(true);
    expect(parsedTool.user).toEqual(
      expect.objectContaining({
        id: 'user-123',
        name: 'Gabriel',
        role: 'admin',
      }),
    );

    const handler = jest.fn().mockResolvedValue({ content: 'ok' });
    await middleware.wrapModelCall?.(
      {
        systemMessage: new SystemMessage('System base'),
      } as never,
      handler,
    );

    const calledRequest = handler.mock.calls[0][0] as {
      systemMessage: SystemMessage;
    };
    const systemText = String(calledRequest.systemMessage.content);
    expect(systemText).toContain(
      '## Verificação de Autenticação JWT (Middleware)',
    );
    expect(systemText).toContain('authenticated: true');
    expect(systemText).toContain('userId: user-123');
    expect(systemText).toContain('userName: Gabriel');
    expect(systemText).toContain('userRole: admin');
  });

  it('marca authenticated: false quando o token é ausente ou inválido', () => {
    const { service } = buildService(
      jest.fn().mockImplementation(() => {
        throw new Error('Token de acesso inválido ou expirado');
      }),
    );

    expect(service.verifyAuthorization(undefined)).toEqual({
      authenticated: false,
      error: 'Token de acesso ausente',
    });

    expect(service.verifyAuthorization('Bearer invalid-token')).toEqual({
      authenticated: false,
      error: 'Token de acesso inválido ou expirado',
    });
  });
});
