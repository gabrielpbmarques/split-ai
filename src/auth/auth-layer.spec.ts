import { Controller, Get, Module, Res } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { FastifyReply } from 'fastify';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { AuthenticationGuard } from 'src/auth/authentication.guard';
import { AuthorizationGuard } from 'src/auth/authorization.guard';
import { PrincipalResolverService } from 'src/auth/principal-resolver.service';
import { TokenVerifier } from 'src/auth/token.verifier';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { Public } from 'src/shared/decorators/public.decorator';
import { User } from 'src/shared/decorators/user.decorator';
import { GlobalExceptionFilter } from 'src/shared/http/exception.filter';
import { createFastifyAdapter } from 'src/shared/http/fastify-adapter';

jest.mock('src/shared/config/env', () => ({
  env: {
    JWT_SECRET: 'native-secret',
    ALLOWED_ORIGINS: [],
  },
}));

const tokenVerifier = { verify: jest.fn() };

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
  @RequirePermissions('user.manage')
  async gestao(@Res() res: FastifyReply): Promise<FastifyReply> {
    return res.status(200).send({ ok: true });
  }

  @Get('chat')
  @RequirePermissions('chat.ask')
  async chat(
    @User('id') userId: string,
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    return res.status(200).send({ userId });
  }
}

@Module({
  controllers: [RecursosController],
  providers: [
    PrincipalResolverService,
    { provide: TokenVerifier, useValue: tokenVerifier },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_GUARD, useClass: AuthenticationGuard },
    { provide: APP_GUARD, useClass: AuthorizationGuard },
  ],
})
class TestModule {}

describe('Auth layer (global guards)', () => {
  let app: NestFastifyApplication;

  const payloadFor = (role: string) => ({ sub: 'u1', role });

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

  it('rejects the ApiKey scheme without calling the verifier', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/recursos/leitura',
      headers: { authorization: 'ApiKey sk' },
    });

    expect(response.statusCode).toBe(401);
    expect(tokenVerifier.verify).not.toHaveBeenCalled();
  });

  it('passes the Bearer token to the verifier', async () => {
    tokenVerifier.verify.mockReturnValue(payloadFor('user'));

    await app.inject({
      method: 'GET',
      url: '/recursos/leitura',
      headers: { authorization: 'Bearer jwt' },
    });

    expect(tokenVerifier.verify).toHaveBeenCalledWith('jwt');
  });

  it('populates request.user and allows a permitted route', async () => {
    tokenVerifier.verify.mockReturnValue(payloadFor('user'));

    const response = await app.inject({
      method: 'GET',
      url: '/recursos/leitura',
      headers: { authorization: 'Bearer jwt' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ id: 'u1', role: 'user' });
  });

  it('answers 403 when the permission is missing', async () => {
    tokenVerifier.verify.mockReturnValue(payloadFor('user'));

    const response = await app.inject({
      method: 'GET',
      url: '/recursos/gestao',
      headers: { authorization: 'Bearer jwt' },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({ category: 'FORBIDDEN' });
  });

  it('lets a guest reach chat and nothing else', async () => {
    tokenVerifier.verify.mockReturnValue(payloadFor('guest'));

    const chat = await app.inject({
      method: 'GET',
      url: '/recursos/chat',
      headers: { authorization: 'Bearer jwt' },
    });
    const leitura = await app.inject({
      method: 'GET',
      url: '/recursos/leitura',
      headers: { authorization: 'Bearer jwt' },
    });

    expect(chat.statusCode).toBe(200);
    expect(chat.json()).toEqual({ userId: 'u1' });
    expect(leitura.statusCode).toBe(403);
  });
});
