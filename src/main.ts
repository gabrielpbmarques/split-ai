import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from 'src/app.module';
// Using Fastify's built-in CORS support instead of the cors package
import { config } from 'src/config';
import { initSentryIo } from 'src/observability/sentry.provider';
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

    // Limpar o Map para evitar vazamentos de memória
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

  // Initialize Sentry before creating the app
  if (config.env === 'production') {
    sentry = initSentryIo();

    // Add Sentry request hooks for Fastify
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

    // Add Sentry error hook for Fastify
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

  // Use PORT environment variable provided by Cloud Run, fallback to 4000 for local development
  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');

  appLogger.log(`Application is running on port ${port}`);
}
bootstrap();
