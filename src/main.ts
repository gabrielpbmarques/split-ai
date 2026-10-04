import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';

import { AppModule } from 'src/app.module';
import { env } from 'src/shared/config/env';
import {
  createCorsOptions,
  createFastifyAdapter,
} from 'src/shared/http/fastify-adapter';
import { createValidationPipe } from 'src/shared/http/validation-pipe';
import { initSentryIo } from 'src/shared/observability/sentry';

async function bootstrap(): Promise<void> {
  if (env.isProduction) {
    initSentryIo();
  }

  const adapter = await createFastifyAdapter();

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
    { bufferLogs: true, rawBody: true, snapshot: !env.isProduction },
  );

  const logger = app.get(Logger);
  app.useLogger(logger);
  app.enableCors(createCorsOptions());
  app.useGlobalPipes(createValidationPipe());
  app.enableShutdownHooks();

  if (!env.isProduction && env.SWAGGER_ENABLED) {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('split-ai')
        .setVersion('0.0.1')
        .addBearerAuth()
        .addApiKey({ type: 'apiKey', name: 'Authorization', in: 'header' })
        .build(),
    );
    SwaggerModule.setup('docs', app, document);
  }

  await app.listen({ port: env.PORT, host: '0.0.0.0' });

  logger.log(`Application is running on port ${env.PORT}`, 'Bootstrap');
}

void bootstrap();
