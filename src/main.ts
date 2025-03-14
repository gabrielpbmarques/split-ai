import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import * as cors from 'cors';
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
  app.use(cors());

  await app.listen(3000);
}
bootstrap();
