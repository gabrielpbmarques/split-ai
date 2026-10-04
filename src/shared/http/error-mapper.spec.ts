import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { z } from 'zod';

import { buildErrorResponse, categoryForStatus } from './error-mapper';

const context = {
  correlationId: 'corr-1',
  path: '/pedidos',
  exposeInternalDetails: false,
};

describe('buildErrorResponse', () => {
  it('maps a Nest HttpException to its status, category and message', () => {
    const body = buildErrorResponse(
      new NotFoundException('Pedido não encontrado'),
      context,
    );

    expect(body).toMatchObject({
      status: 404,
      category: 'NOT_FOUND',
      code: 'HTTP_404',
      message: 'Pedido não encontrado',
      correlationId: 'corr-1',
      path: '/pedidos',
    });
    expect(body.details).toBeUndefined();
  });

  it('keeps structured validation details from a BadRequestException body', () => {
    const body = buildErrorResponse(
      new BadRequestException({
        message: 'Dados de entrada inválidos',
        details: [{ field: 'nome', message: 'obrigatório' }],
      }),
      context,
    );

    expect(body.category).toBe('VALIDATION');
    expect(body.details).toEqual([{ field: 'nome', message: 'obrigatório' }]);
  });

  it('turns the default class-validator message array into details', () => {
    const body = buildErrorResponse(
      new BadRequestException(['nome must be a string']),
      context,
    );

    expect(body.message).toBe('Dados de entrada inválidos');
    expect(body.details).toEqual([
      { field: '', message: 'nome must be a string' },
    ]);
  });

  it('maps a ZodError to 400 with one detail per issue', () => {
    const result = z.object({ idade: z.number() }).safeParse({ idade: 'x' });
    const body = buildErrorResponse(
      result.success ? null : result.error,
      context,
    );

    expect(body).toMatchObject({
      status: 400,
      code: 'VALIDATION_FAILED',
      category: 'VALIDATION',
    });
    expect(body.details?.[0].field).toBe('idade');
  });

  it('hides the message of an unclassified error in production', () => {
    const body = buildErrorResponse(new Error('senha do banco: x'), context);

    expect(body).toMatchObject({
      status: 500,
      category: 'INTERNAL',
      code: 'INTERNAL_ERROR',
    });
    expect(body.message).not.toContain('senha');
  });

  it('exposes the message of an unclassified error outside production', () => {
    const body = buildErrorResponse(new Error('detalhe interno'), {
      ...context,
      exposeInternalDetails: true,
    });

    expect(body.message).toBe('detalhe interno');
  });

  it('honours a numeric statusCode carried by a non-Nest error', () => {
    const error = Object.assign(new Error('JSON inválido'), {
      statusCode: 400,
    });

    expect(buildErrorResponse(error, context)).toMatchObject({
      status: 400,
      message: 'JSON inválido',
      category: 'VALIDATION',
    });
  });

  it('derives the category from the status', () => {
    expect(categoryForStatus(409)).toBe('CONFLICT');
    expect(categoryForStatus(429)).toBe('RATE_LIMITED');
    expect(categoryForStatus(418)).toBe('VALIDATION');
    expect(categoryForStatus(504)).toBe('INTERNAL');
    expect(buildErrorResponse(new ConflictException(), context).category).toBe(
      'CONFLICT',
    );
  });
});
