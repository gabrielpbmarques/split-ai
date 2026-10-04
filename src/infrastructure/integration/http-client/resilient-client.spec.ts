import { CircuitOpenError } from 'src/infrastructure/integration/http-client/circuit-breaker';
import {
  HttpResponseError,
  HttpTimeoutError,
  ResilientClient,
} from 'src/infrastructure/integration/http-client/resilient-client';
import { SsrfBlockedError } from 'src/infrastructure/integration/http-client/ssrf-guard';

jest.mock('src/shared/observability/correlation', () => ({
  currentCorrelationId: () => 'corr-123',
}));

type FetchMock = jest.Mock<Promise<Response>, [URL, RequestInit]>;

const jsonResponse = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const build = (fetchImpl: FetchMock, overrides = {}): ResilientClient =>
  new ResilientClient({
    name: 'test',
    baseUrl: 'https://api.example.com',
    timeoutMs: 50,
    retries: 2,
    backoffBaseMs: 1,
    circuitFailureThreshold: 2,
    circuitOpenMs: 60_000,
    ssrf: { allowedHosts: ['api.example.com'], allowInternalNetwork: false },
    fetchImpl: fetchImpl as unknown as typeof fetch,
    sleep: async () => undefined,
    ...overrides,
  });

describe('ResilientClient', () => {
  it('sends JSON bodies with correlation header and redirect: error', async () => {
    const fetchImpl: FetchMock = jest
      .fn()
      .mockResolvedValue(jsonResponse(200, { ok: 1 }));
    const client = build(fetchImpl);

    const result = await client.requestJson<{ ok: number }>({
      path: '/v1/thing',
      method: 'POST',
      body: { a: 1 },
    });

    expect(result).toEqual({ ok: 1 });

    const [url, init] = fetchImpl.mock.calls[0];
    expect(url.toString()).toBe('https://api.example.com/v1/thing');
    expect(init.method).toBe('POST');
    expect(init.redirect).toBe('error');
    expect(init.body).toBe('{"a":1}');
    expect(init.headers).toMatchObject({
      'content-type': 'application/json',
      'x-request-id': 'corr-123',
    });
  });

  it('retries idempotent requests on retryable statuses', async () => {
    const fetchImpl: FetchMock = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse(503, {}))
      .mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    const result = await build(fetchImpl, {
      circuitFailureThreshold: 10,
    }).requestJson({
      path: '/v1/thing',
    });

    expect(result).toEqual({ ok: true });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('does not retry POST requests', async () => {
    const fetchImpl: FetchMock = jest
      .fn()
      .mockResolvedValue(jsonResponse(503, {}));

    await expect(
      build(fetchImpl).requestJson({ path: '/v1/thing', method: 'POST' }),
    ).rejects.toBeInstanceOf(HttpResponseError);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('does not retry non-retryable statuses', async () => {
    const fetchImpl: FetchMock = jest
      .fn()
      .mockResolvedValue(jsonResponse(404, {}));

    await expect(
      build(fetchImpl).requestJson({ path: '/x' }),
    ).rejects.toMatchObject({
      status: 404,
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('opens the circuit after consecutive failures', async () => {
    const fetchImpl: FetchMock = jest
      .fn()
      .mockResolvedValue(jsonResponse(500, {}));
    const client = build(fetchImpl, { retries: 0 });

    await expect(client.send({ path: '/x' })).rejects.toBeInstanceOf(
      HttpResponseError,
    );
    await expect(client.send({ path: '/x' })).rejects.toBeInstanceOf(
      HttpResponseError,
    );
    await expect(client.send({ path: '/x' })).rejects.toBeInstanceOf(
      CircuitOpenError,
    );
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('turns an abort into HttpTimeoutError', async () => {
    const fetchImpl: FetchMock = jest.fn(
      (_url, init) =>
        new Promise<Response>((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => {
            const error = new Error('aborted');
            error.name = 'AbortError';
            reject(error);
          });
        }),
    );

    await expect(
      build(fetchImpl, { retries: 0, timeoutMs: 5 }).send({ path: '/slow' }),
    ).rejects.toBeInstanceOf(HttpTimeoutError);
  });

  it('refuses hosts outside the allowlist before any network call', async () => {
    const fetchImpl: FetchMock = jest.fn();

    await expect(
      build(fetchImpl).send({ url: 'https://evil.example.org/' }),
    ).rejects.toBeInstanceOf(SsrfBlockedError);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
