import { Logger } from '@nestjs/common';

import {
  computeBackoffMs,
  isRetryable,
} from 'src/infrastructure/integration/http-client/backoff';
import { CircuitBreaker } from 'src/infrastructure/integration/http-client/circuit-breaker';
import {
  assertAllowedUrl,
  type SsrfGuardOptions,
} from 'src/infrastructure/integration/http-client/ssrf-guard';
import { currentCorrelationId } from 'src/shared/observability/correlation';

export type HttpMethod =
  | 'GET'
  | 'HEAD'
  | 'OPTIONS'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE';

export interface ResilientClientOptions {
  readonly name: string;
  readonly baseUrl?: string;
  readonly timeoutMs: number;
  readonly retries: number;
  readonly backoffBaseMs: number;
  readonly circuitFailureThreshold: number;
  readonly circuitOpenMs: number;
  readonly ssrf: SsrfGuardOptions;
  readonly defaultHeaders?: Readonly<Record<string, string>>;
  readonly fetchImpl?: typeof fetch;
  readonly sleep?: (ms: number) => Promise<void>;
}

export interface HttpRequestOptions {
  readonly path?: string;
  readonly url?: string;
  readonly method?: HttpMethod;
  readonly headers?: Readonly<Record<string, string>>;
  readonly body?: unknown;
  readonly timeoutMs?: number;
}

export class HttpResponseError extends Error {
  constructor(
    readonly status: number,
    readonly statusText: string,
    readonly body: string,
    readonly url: string,
  ) {
    super(`${status} ${statusText} em ${url}`);
    this.name = 'HttpResponseError';
  }
}

export class HttpTimeoutError extends Error {
  constructor(
    readonly url: string,
    readonly timeoutMs: number,
  ) {
    super(`Timeout de ${timeoutMs}ms em ${url}`);
    this.name = 'HttpTimeoutError';
  }
}

const CORRELATION_HEADER = 'x-request-id';

const defaultSleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export class ResilientClient {
  private readonly logger: Logger;
  private readonly breaker: CircuitBreaker;
  private readonly fetchImpl: typeof fetch;
  private readonly sleep: (ms: number) => Promise<void>;

  constructor(private readonly options: ResilientClientOptions) {
    this.logger = new Logger(`ResilientClient:${options.name}`);
    this.breaker = new CircuitBreaker(options.name, {
      failureThreshold: options.circuitFailureThreshold,
      openMs: options.circuitOpenMs,
    });
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.sleep = options.sleep ?? defaultSleep;
  }

  circuitState(): ReturnType<CircuitBreaker['state']> {
    return this.breaker.state();
  }

  async requestJson<T = unknown>(request: HttpRequestOptions): Promise<T> {
    const response = await this.send(request);
    return (await response.json()) as T;
  }

  async requestText(request: HttpRequestOptions): Promise<string> {
    const response = await this.send(request);
    return response.text();
  }

  async requestBuffer(request: HttpRequestOptions): Promise<Buffer> {
    const response = await this.send(request);
    return Buffer.from(await response.arrayBuffer());
  }

  async send(request: HttpRequestOptions): Promise<Response> {
    const url = this.resolveUrl(request);
    const method = request.method ?? 'GET';
    const maxAttempts = isRetryable(method) ? this.options.retries + 1 : 1;

    let attempt = 0;

    for (;;) {
      this.breaker.assertCanRequest();

      try {
        const response = await this.fetchOnce(url, method, request);

        if (!response.ok) {
          const body = await response.text().catch(() => '');
          throw new HttpResponseError(
            response.status,
            response.statusText,
            body,
            url.toString(),
          );
        }

        this.breaker.recordSuccess();
        return response;
      } catch (error) {
        this.breaker.recordFailure();

        const status =
          error instanceof HttpResponseError ? error.status : undefined;
        const canRetry =
          attempt + 1 < maxAttempts && isRetryable(method, status);

        if (!canRetry) {
          throw error;
        }

        const delay = computeBackoffMs(attempt, {
          baseMs: this.options.backoffBaseMs,
        });

        this.logger.warn(
          `${method} ${url.pathname} falhou (${status ?? (error as Error).name}); nova tentativa em ${delay}ms`,
        );

        attempt += 1;
        await this.sleep(delay);
      }
    }
  }

  private resolveUrl(request: HttpRequestOptions): URL {
    const raw =
      request.url ??
      new URL(request.path ?? '', this.options.baseUrl).toString();
    return assertAllowedUrl(raw, this.options.ssrf);
  }

  private async fetchOnce(
    url: URL,
    method: HttpMethod,
    request: HttpRequestOptions,
  ): Promise<Response> {
    const timeoutMs = request.timeoutMs ?? this.options.timeoutMs;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const headers: Record<string, string> = {
      accept: 'application/json',
      ...this.options.defaultHeaders,
      ...request.headers,
    };

    const correlationId = currentCorrelationId();

    if (correlationId) {
      headers[CORRELATION_HEADER] = correlationId;
    }

    let body: string | undefined;

    if (request.body !== undefined) {
      body =
        typeof request.body === 'string'
          ? request.body
          : JSON.stringify(request.body);
      headers['content-type'] ??= 'application/json';
    }

    try {
      return await this.fetchImpl(url, {
        method,
        headers,
        body,
        redirect: 'error',
        signal: controller.signal,
      });
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new HttpTimeoutError(url.toString(), timeoutMs);
      }

      throw error;
    } finally {
      clearTimeout(timer);
    }
  }
}
