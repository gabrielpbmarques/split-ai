import type { FastifyCorsOptions } from '@fastify/cors';
import { FastifyAdapter } from '@nestjs/platform-fastify';

import { env } from 'src/shared/config/env';
import {
  generateRequestId,
  registerRequestContext,
} from 'src/shared/observability/correlation';

type AdapterPlugin = Parameters<FastifyAdapter['register']>[0];

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
const MAX_UPLOAD_FILES = 5;

export async function createFastifyAdapter(): Promise<FastifyAdapter> {
  const adapter = new FastifyAdapter({
    logger: false,
    genReqId: generateRequestId,
    requestIdHeader: false,
  });

  const { default: helmet } = await import('@fastify/helmet');
  await adapter.register(helmet as unknown as AdapterPlugin, {
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
  });

  const { default: multipart } = await import('@fastify/multipart');
  await adapter.register(multipart as unknown as AdapterPlugin, {
    attachFieldsToBody: true,
    limits: { fileSize: MAX_UPLOAD_BYTES, files: MAX_UPLOAD_FILES },
  });

  registerRequestContext(adapter.getInstance());

  return adapter;
}

export function createCorsOptions(): FastifyCorsOptions {
  return {
    origin: env.ALLOWED_ORIGINS.length > 0 ? env.ALLOWED_ORIGINS : true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'X-Request-Id',
    ],
    exposedHeaders: ['Content-Type', 'X-Request-Id'],
  };
}
