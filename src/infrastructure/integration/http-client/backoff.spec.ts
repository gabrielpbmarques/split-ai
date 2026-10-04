import {
  computeBackoffMs,
  isRetryable,
} from 'src/infrastructure/integration/http-client/backoff';

describe('backoff', () => {
  it('grows exponentially with full jitter between 50% and 100%', () => {
    expect(computeBackoffMs(0, { baseMs: 200, random: () => 0 })).toBe(100);
    expect(computeBackoffMs(0, { baseMs: 200, random: () => 1 })).toBe(200);
    expect(computeBackoffMs(2, { baseMs: 200, random: () => 1 })).toBe(800);
  });

  it('caps the delay at maxMs', () => {
    expect(
      computeBackoffMs(10, { baseMs: 200, maxMs: 1_000, random: () => 1 }),
    ).toBe(1_000);
  });

  it('retries only idempotent methods', () => {
    expect(isRetryable('GET')).toBe(true);
    expect(isRetryable('head', 503)).toBe(true);
    expect(isRetryable('POST')).toBe(false);
    expect(isRetryable('POST', 503)).toBe(false);
  });

  it('retries only the configured statuses', () => {
    expect(isRetryable('GET', 429)).toBe(true);
    expect(isRetryable('GET', 502)).toBe(true);
    expect(isRetryable('GET', 404)).toBe(false);
    expect(isRetryable('GET', 400)).toBe(false);
  });
});
