import { NestFactory } from '@nestjs/core';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import supertest from 'supertest';
import { DataSource } from 'typeorm';

import { AppModule } from 'src/app.module';
import {
  createCorsOptions,
  createFastifyAdapter,
} from 'src/shared/http/fastify-adapter';
import { createValidationPipe } from 'src/shared/http/validation-pipe';
import { resetDatabase } from 'test/support/database';

export interface TestApp {
  readonly app: NestFastifyApplication;
  readonly dataSource: DataSource;
  readonly http: () => supertest.Agent;
  reset(): Promise<void>;
  close(): Promise<void>;
}

export async function createTestApp(): Promise<TestApp> {
  const adapter = await createFastifyAdapter();
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
    { logger: false, rawBody: true },
  );

  app.enableCors(createCorsOptions());
  app.useGlobalPipes(createValidationPipe());

  await app.init();
  await app.getHttpAdapter().getInstance().ready();

  const dataSource = app.get(DataSource);

  return {
    app,
    dataSource,
    http: () => supertest(app.getHttpServer()),
    reset: () => resetDatabase(dataSource),
    close: () => app.close(),
  };
}
