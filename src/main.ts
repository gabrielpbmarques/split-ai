import { NestFactory } from '@nestjs/core';
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

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: true,
    }),
  );

  if (config.env === 'production') {
    sentry = initSentryIo();
    app.use(sentry?.Handlers.requestHandler());
    app.use(sentry?.Handlers.tracingHandler());
    app.use(sentry?.Handlers.errorHandler());
  }
  app.enableCors();

  // Use PORT environment variable provided by Cloud Run, fallback to 80 for local development
  const port = process.env.PORT || 80;
  await app.listen(port, '0.0.0.0');

  console.log(`Application is running on port ${port}`);
}
bootstrap();
