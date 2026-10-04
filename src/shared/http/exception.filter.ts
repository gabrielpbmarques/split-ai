import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { FastifyReply, FastifyRequest } from 'fastify';

import { env } from 'src/shared/config/env';
import { buildErrorResponse } from 'src/shared/http/error-mapper';
import { currentCorrelationId } from 'src/shared/observability/correlation';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(error: unknown, host: ArgumentsHost): void {
    if (host.getType() !== 'http') {
      throw error;
    }

    const http = host.switchToHttp();
    const request = http.getRequest<FastifyRequest>();
    const reply = http.getResponse<FastifyReply>();

    const body = buildErrorResponse(error, {
      correlationId: currentCorrelationId() ?? String(request.id),
      path: request.url,
      exposeInternalDetails: !env.isProduction,
    });

    const logData = {
      method: request.method,
      route: request.url,
      status: body.status,
      errorCode: body.code,
      correlationId: body.correlationId,
    };

    if (body.status >= 500) {
      this.logger.error({ ...logData, err: error }, 'request.error');

      if (env.isProduction) {
        Sentry.captureException(error);
      }
    } else {
      this.logger.warn(logData, 'request.rejected');
    }

    if (reply.sent || reply.raw.headersSent) {
      return;
    }

    void reply.status(body.status).send(body);
  }
}
