import { Controller, Get, Module, Res } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { FastifyReply } from 'fastify';

import { AccessScopeService } from 'src/auth/access-scope.service';
import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { AuthenticationGuard } from 'src/auth/authentication.guard';
import { AuthorizationGuard } from 'src/auth/authorization.guard';
import { PrincipalResolverService } from 'src/auth/principal-resolver.service';
import { TokenVerifier } from 'src/auth/token.verifier';
import { RequireActiveOrganization } from 'src/shared/decorators/active-organization.decorator';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { Public } from 'src/shared/decorators/public.decorator';
import { User } from 'src/shared/decorators/user.decorator';
import { GlobalExceptionFilter } from 'src/shared/http/exception.filter';
import { createFastifyAdapter } from 'src/shared/http/fastify-adapter';

jest.mock('src/shared/config/env', () => ({
  env: {
    JWT_SECRET: 'native-secret',
    BRAVOHUB_ORG_ID: 'bravohub-org',
    AUTH_PRINCIPAL_CACHE_TTL_MS: 60_000,
    ALLOWED_ORIGINS: [],
  },
}));

const tokenVerifier = { verify: jest.fn() };
const organizationRepository = { findById: jest.fn() };

@Controller('recursos')
class RecursosController {
  @Get('publico')
  @Public()
  async publico(@Res() res: FastifyReply): Promise<FastifyReply> {
    return res.status(200).send({ ok: true });
  }

  @Get('leitura')
  @RequirePermissions('agent.read')
  async leitura(
    @User() user: AuthenticatedUser,
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    return res.status(200).send({ id: user.id, role: user.role });
  }

  @Get('gestao')
  @RequirePermissions('organization.manage')
  async gestao(@Res() res: FastifyReply): Promise<FastifyReply> {
    return res.status(200).send({ ok: true });
  }

  @Get('chat')
  @RequirePermissions('chat.ask')
  @RequireActiveOrganization()
  async chat(
    @User('organization_id') organizationId: string,
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    return res.status(200).send({ organizationId });
  }
}

@Module({
  controllers: [RecursosController],
  providers: [
    AccessScopeService,
    { provide: TokenVerifier, useValue: tokenVerifier },
    {
      provide: PrincipalResolverService,
      useFactory: () =>
        new PrincipalResolverService(organizationRepository as any),
    },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_GUARD, useClass: AuthenticationGuard },
    { provide: APP_GUARD, useClass: AuthorizationGuard },
  ],
})
class TestModule {}

describe('Auth layer (global guards)', () => {
  let app: NestFastifyApplication;

  const principalFor = (role: string, extra: Record<string, unknown> = {}) => ({
    kind: 'user',
    payload: { sub: 'u1', role, organization_id: 'org-1', ...extra },
  });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      await createFastifyAdapter(),
      { logger: false },
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    organizationRepository.findById.mockResolvedValue({ status: 'active' });
  });

  it('lets public routes through without a token', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/recursos/publico',
    });

    expect(response.statusCode).toBe(200);
    expect(tokenVerifier.verify).not.toHaveBeenCalled();
  });

  it('answers 401 when the token is missing', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/recursos/leitura',
    });

    expect(response.statusCode).toBe(401);
  });

  it('answers 401 for an unsupported scheme', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/recursos/leitura',
      headers: { authorization: 'Basic abc' },
    });

    expect(response.statusCode).toBe(401);
    expect(tokenVerifier.verify).not.toHaveBeenCalled();
  });

  it('dispatches Bearer and ApiKey schemes to the verifier', async () => {
    tokenVerifier.verify.mockResolvedValue(principalFor('user'));

    await app.inject({
      method: 'GET',
      url: '/recursos/leitura',
      headers: { authorization: 'Bearer jwt' },
    });
    await app.inject({
      method: 'GET',
      url: '/recursos/leitura',
      headers: { authorization: 'ApiKey sk' },
    });

    expect(tokenVerifier.verify).toHaveBeenNthCalledWith(1, 'bearer', 'jwt');
    expect(tokenVerifier.verify).toHaveBeenNthCalledWith(2, 'apikey', 'sk');
  });

  it('populates request.user and allows a permitted route', async () => {
    tokenVerifier.verify.mockResolvedValue(principalFor('user'));

    const response = await app.inject({
      method: 'GET',
      url: '/recursos/leitura',
      headers: { authorization: 'Bearer jwt' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ id: 'u1', role: 'user' });
  });

  it('answers 403 when the permission is missing', async () => {
    tokenVerifier.verify.mockResolvedValue(principalFor('user'));

    const response = await app.inject({
      method: 'GET',
      url: '/recursos/gestao',
      headers: { authorization: 'Bearer jwt' },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({ category: 'FORBIDDEN' });
  });

  it('answers 403 on routes that require an active organization when it is inactive', async () => {
    tokenVerifier.verify.mockResolvedValue(
      principalFor('user', { organization_id: 'org-inactive' }),
    );
    organizationRepository.findById.mockResolvedValue({ status: 'inactive' });

    const response = await app.inject({
      method: 'GET',
      url: '/recursos/chat',
      headers: { authorization: 'Bearer jwt' },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().message).toMatch(/organização está inativa/);
  });

  it('lets a service principal reach chat and nothing else', async () => {
    tokenVerifier.verify.mockResolvedValue({
      kind: 'service',
      apiKey: { id: 'k1', organization_id: 'org-9', scopes: null },
    });

    const chat = await app.inject({
      method: 'GET',
      url: '/recursos/chat',
      headers: { authorization: 'ApiKey sk' },
    });
    const leitura = await app.inject({
      method: 'GET',
      url: '/recursos/leitura',
      headers: { authorization: 'ApiKey sk' },
    });

    expect(chat.statusCode).toBe(200);
    expect(chat.json()).toEqual({ organizationId: 'org-9' });
    expect(leitura.statusCode).toBe(403);
  });
});
