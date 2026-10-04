export interface BackoffOptions {
  readonly baseMs: number;
  readonly maxMs?: number;
  readonly random?: () => number;
}

const DEFAULT_MAX_MS = 10_000;

export function computeBackoffMs(
  attempt: number,
  options: BackoffOptions,
): number {
  const maxMs = options.maxMs ?? DEFAULT_MAX_MS;
  const random = options.random ?? Math.random;
  const exponential = Math.min(maxMs, options.baseMs * 2 ** attempt);
  const jitter = 0.5 + random() * 0.5;

  return Math.round(exponential * jitter);
}

export const RETRYABLE_METHODS: ReadonlySet<string> = new Set([
  'GET',
  'HEAD',
  'OPTIONS',
]);

export const RETRYABLE_STATUSES: ReadonlySet<number> = new Set([
  408, 425, 429, 500, 502, 503, 504,
]);

export function isRetryable(method: string, status?: number): boolean {
  if (!RETRYABLE_METHODS.has(method.toUpperCase())) {
    return false;
  }

  return status === undefined || RETRYABLE_STATUSES.has(status);
}
