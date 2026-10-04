import {
  Body,
  Controller,
  Get,
  Module,
  NotFoundException,
  Post,
  Res,
} from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { IsInt, IsString, MaxLength, Min } from 'class-validator';
import { FastifyReply } from 'fastify';

import { GlobalExceptionFilter } from 'src/shared/http/exception.filter';
import {
  createCorsOptions,
  createFastifyAdapter,
} from 'src/shared/http/fastify-adapter';
import { createValidationPipe } from 'src/shared/http/validation-pipe';

class CriarPedidoDto {
  @IsString()
  @MaxLength(10)
  codigo: string;

  @IsInt()
  @Min(1)
  quantidade: number;
}

@Controller('pedidos')
class PedidosController {
  @Post()
  async criar(
    @Body() dto: CriarPedidoDto,
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    return res.status(201).send(dto);
  }

  @Get('inexistente')
  async inexistente(): Promise<void> {
    throw new NotFoundException('Pedido não encontrado');
  }

  @Get('quebrado')
  async quebrado(): Promise<void> {
    throw new Error('detalhe interno');
  }
}

@Module({
  controllers: [PedidosController],
  providers: [{ provide: APP_FILTER, useClass: GlobalExceptionFilter }],
})
class TestModule {}

describe('HTTP layer (adapter + validation pipe + exception filter)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      await createFastifyAdapter(),
      { logger: false },
    );
    app.enableCors(createCorsOptions());
    app.useGlobalPipes(createValidationPipe());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('accepts a valid body and echoes the request id header', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/pedidos',
      headers: { 'x-request-id': 'req-42' },
      payload: { codigo: 'A1', quantidade: 2 },
    });

    expect(response.statusCode).toBe(201);
    expect(response.headers['x-request-id']).toBe('req-42');
    expect(response.json()).toEqual({ codigo: 'A1', quantidade: 2 });
  });

  it('rejects unknown and invalid fields with an ErrorResponse carrying details', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/pedidos',
      payload: { codigo: 'A1', quantidade: 0, extra: true },
    });

    const body = response.json();

    expect(response.statusCode).toBe(400);
    expect(body).toMatchObject({
      status: 400,
      category: 'VALIDATION',
      code: 'HTTP_400',
      path: '/pedidos',
    });
    expect(body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'quantidade' }),
        expect.objectContaining({ field: 'extra' }),
      ]),
    );
    expect(typeof body.correlationId).toBe('string');
  });

  it('does not convert numeric strings implicitly', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/pedidos',
      payload: { codigo: 'A1', quantidade: '2' },
    });

    expect(response.statusCode).toBe(400);
  });

  it('formats Nest exceptions thrown by handlers', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/pedidos/inexistente',
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({
      category: 'NOT_FOUND',
      message: 'Pedido não encontrado',
    });
  });

  it('formats unexpected errors as 500 without leaking internals', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/pedidos/quebrado',
    });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toMatchObject({
      category: 'INTERNAL',
      code: 'INTERNAL_ERROR',
    });
  });

  it('sets security headers but does not block cross-origin embedding', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/pedidos/inexistente',
    });

    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBeUndefined();
    expect(response.headers['content-security-policy']).toBeUndefined();
  });
});
