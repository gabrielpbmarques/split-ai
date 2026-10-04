import type { IncomingMessage, ServerResponse } from 'node:http';

import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';

import { env } from 'src/shared/config/env';

const IGNORED_PREFIXES = ['/health'];

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: env.LOG_LEVEL,
        transport: env.isProduction
          ? undefined
          : { target: 'pino-pretty', options: { singleLine: true } },
        autoLogging: {
          ignore: (request: IncomingMessage) =>
            IGNORED_PREFIXES.some((prefix) =>
              (request.url ?? '').startsWith(prefix),
            ),
        },
        customProps: (request: IncomingMessage) => ({
          correlationId: (request as IncomingMessage & { id?: string }).id,
        }),
        customLogLevel: (
          _request: IncomingMessage,
          response: ServerResponse,
          error?: Error,
        ) => {
          if (error || response.statusCode >= 500) {
            return 'error';
          }

          return response.statusCode >= 400 ? 'warn' : 'info';
        },
        customSuccessMessage: () => 'request.completed',
        customErrorMessage: () => 'request.failed',
        serializers: {
          req: (request: {
            id: string;
            method: string;
            url: string;
            remoteAddress?: string;
          }) => ({
            id: request.id,
            method: request.method,
            url: request.url,
            remoteAddress: request.remoteAddress,
          }),
          res: (response: { statusCode: number }) => ({
            statusCode: response.statusCode,
          }),
        },
        redact: {
          paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'req.headers["stripe-signature"]',
            '*.password',
            '*.password_hash',
            '*.token',
            '*.secret',
            '*.key_hash',
          ],
          censor: '[REDACTED]',
        },
      },
    }),
  ],
})
export class AppLoggerModule {}
