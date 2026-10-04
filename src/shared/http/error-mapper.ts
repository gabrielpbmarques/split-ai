import { HttpException, HttpStatus } from '@nestjs/common';
import { ZodError } from 'zod';

import {
  ErrorCategory,
  ErrorDetail,
  ErrorResponse,
} from 'src/shared/contracts/error-response';

export interface ErrorContext {
  readonly correlationId: string;
  readonly path: string;
  readonly exposeInternalDetails: boolean;
}

const INTERNAL_MESSAGE = 'Erro interno. Tente novamente mais tarde.';

const CATEGORY_BY_STATUS: Record<number, ErrorCategory> = {
  [HttpStatus.BAD_REQUEST]: 'VALIDATION',
  [HttpStatus.UNAUTHORIZED]: 'UNAUTHENTICATED',
  [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
  [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
  [HttpStatus.CONFLICT]: 'CONFLICT',
  [HttpStatus.PRECONDITION_FAILED]: 'PRECONDITION',
  [HttpStatus.TOO_MANY_REQUESTS]: 'RATE_LIMITED',
  [HttpStatus.BAD_GATEWAY]: 'EXTERNAL_DEPENDENCY',
  [HttpStatus.SERVICE_UNAVAILABLE]: 'UNAVAILABLE',
};

export function categoryForStatus(status: number): ErrorCategory {
  const known = CATEGORY_BY_STATUS[status];

  if (known) {
    return known;
  }

  return status >= 500 ? 'INTERNAL' : 'VALIDATION';
}

interface HttpExceptionBody {
  message?: unknown;
  details?: unknown;
}

function isErrorDetail(value: unknown): value is ErrorDetail {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as ErrorDetail).field === 'string' &&
    typeof (value as ErrorDetail).message === 'string'
  );
}

function detailsFromBody(body: HttpExceptionBody): ErrorDetail[] | undefined {
  if (Array.isArray(body.details) && body.details.every(isErrorDetail)) {
    return body.details;
  }

  if (Array.isArray(body.message)) {
    return body.message
      .filter((item): item is string => typeof item === 'string')
      .map((message) => ({ field: '', message }));
  }

  return undefined;
}

function messageFromBody(body: HttpExceptionBody, fallback: string): string {
  if (typeof body.message === 'string' && body.message.length > 0) {
    return body.message;
  }

  if (Array.isArray(body.message) && body.message.length > 0) {
    return 'Dados de entrada inválidos';
  }

  return fallback;
}

function hasNumericStatus(error: unknown): error is { statusCode: number } {
  const status = (error as { statusCode?: unknown })?.statusCode;

  return typeof status === 'number' && status >= 400 && status <= 599;
}

export function buildErrorResponse(
  error: unknown,
  context: ErrorContext,
): ErrorResponse {
  const base = {
    correlationId: context.correlationId,
    timestamp: new Date().toISOString(),
    path: context.path,
  };

  if (error instanceof HttpException) {
    const status = error.getStatus();
    const response = error.getResponse();
    const body: HttpExceptionBody =
      typeof response === 'string' ? { message: response } : (response ?? {});

    return {
      ...base,
      status,
      category: categoryForStatus(status),
      code: `HTTP_${status}`,
      message: messageFromBody(body, error.message),
      details: detailsFromBody(body),
    };
  }

  if (error instanceof ZodError) {
    return {
      ...base,
      status: HttpStatus.BAD_REQUEST,
      category: 'VALIDATION',
      code: 'VALIDATION_FAILED',
      message: 'Dados de entrada inválidos',
      details: error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    };
  }

  if (hasNumericStatus(error)) {
    const status = error.statusCode;
    const message = (error as { message?: string }).message;

    return {
      ...base,
      status,
      category: categoryForStatus(status),
      code: `HTTP_${status}`,
      message:
        status < 500 || context.exposeInternalDetails
          ? message || INTERNAL_MESSAGE
          : INTERNAL_MESSAGE,
    };
  }

  const message = (error as { message?: string })?.message;

  return {
    ...base,
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    category: 'INTERNAL',
    code: 'INTERNAL_ERROR',
    message:
      context.exposeInternalDetails && message ? message : INTERNAL_MESSAGE,
  };
}
