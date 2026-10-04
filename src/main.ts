import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from 'src/app.module';
import { initSentryIo } from 'src/observability/sentry.provider';
import { env } from 'src/shared/config/env';

async function bootstrap() {
  let sentry: any;
  const appLogger = new Logger('AppModule');
  const apiLogger = new Logger('API');

  const fastifyAdapter = new FastifyAdapter({
    logger: true,
  });

  const { default: fastifyMultipart } = await import('@fastify/multipart');
  await fastifyAdapter.register(fastifyMultipart as any, {
    attachFieldsToBody: true,
    limits: {
      fileSize: 20 * 1024 * 1024,
      files: 5,
    },
  });

  const requestTimes = new Map<string, number>();

  fastifyAdapter.getInstance().addHook('onRequest', (request, reply, done) => {
    const startTime = Date.now();
    const requestId = `${request.method}-${request.url}-${startTime}`;
    requestTimes.set(requestId, startTime);
    (request as any).requestId = requestId;

    apiLogger.log(`📥 ${request.method} ${request.url}`, {
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
      body: request.body,
      query: request.query,
      params: request.params,
      timestamp: new Date().toISOString(),
    });

    done();
  });

  fastifyAdapter.getInstance().addHook('onResponse', (request, reply, done) => {
    const requestId = (request as any).requestId;
    const startTime = requestTimes.get(requestId) || Date.now();
    const duration = Date.now() - startTime;
    const statusCode = reply.statusCode;

    requestTimes.delete(requestId);

    const logLevel =
      statusCode >= 400 ? 'error' : statusCode >= 300 ? 'warn' : 'log';
    const emoji = statusCode >= 400 ? '❌' : statusCode >= 300 ? '⚠️' : '✅';

    apiLogger[logLevel](
      `📤 ${emoji} ${request.method} ${request.url} - ${statusCode} - ${duration}ms`,
      {
        method: request.method,
        url: request.url,
        statusCode,
        duration,
        timestamp: new Date().toISOString(),
      },
    );

    done();
  });

  if (env.isProduction) {
    sentry = initSentryIo();

    fastifyAdapter
      .getInstance()
      .addHook('onRequest', (request, reply, done) => {
        sentry.setUser({ ip_address: request.ip });
        sentry.setContext('request', {
          method: request.method,
          url: request.url,
          headers: request.headers,
        });
        done();
      });

    fastifyAdapter
      .getInstance()
      .addHook('onError', (request, reply, error, done) => {
        sentry.captureException(error);
        done();
      });
  }

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
    {
      snapshot: true,
    },
  );

  app.enableCors();

  await app.listen(env.PORT, '0.0.0.0');

  appLogger.log(`Application is running on port ${env.PORT}`);
}
bootstrap();
