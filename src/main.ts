import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
// Using Fastify's built-in CORS support instead of the cors package
import { config } from './config';
import { initSentryIo } from './observability/sentry.provider';

async function bootstrap() {
  let sentry: any;
  const appLogger = new Logger('AppModule');

  const fastifyAdapter = new FastifyAdapter({
    logger: true,
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
  );

  app.enableCors();

  // Use PORT environment variable provided by Cloud Run, fallback to 3000 for local development
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  appLogger.log(`Application is running on port ${port}`);
}
bootstrap();
