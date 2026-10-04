import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import { IncomingMessage } from 'node:http';

import { FastifyInstance } from 'fastify';

export interface RequestContext {
  readonly correlationId: string;
  readonly traceId?: string;
}

const REQUEST_ID_HEADER = 'x-request-id';
const VALID_REQUEST_ID = /^[A-Za-z0-9._-]{1,128}$/;
const TRACEPARENT = /^[0-9a-f]{2}-([0-9a-f]{32})-[0-9a-f]{16}-[0-9a-f]{2}$/;

const storage = new AsyncLocalStorage<RequestContext>();

export function generateRequestId(request: IncomingMessage): string {
  const received = request.headers[REQUEST_ID_HEADER];
  const candidate = Array.isArray(received) ? received[0] : received;

  return candidate && VALID_REQUEST_ID.test(candidate)
    ? candidate
    : randomUUID();
}

export function extractTraceId(
  traceparent: string | string[] | undefined,
): string | undefined {
  const header = Array.isArray(traceparent) ? traceparent[0] : traceparent;
  const match = header ? TRACEPARENT.exec(header) : null;

  return match ? match[1] : undefined;
}

export function registerRequestContext(instance: FastifyInstance): void {
  instance.addHook('onRequest', (request, reply, done) => {
    reply.header(REQUEST_ID_HEADER, request.id);
    storage.run(
      {
        correlationId: String(request.id),
        traceId: extractTraceId(request.headers.traceparent),
      },
      done,
    );
  });
}

export function currentCorrelationId(): string | undefined {
  return storage.getStore()?.correlationId;
}

export function currentTraceId(): string | undefined {
  return storage.getStore()?.traceId;
}
