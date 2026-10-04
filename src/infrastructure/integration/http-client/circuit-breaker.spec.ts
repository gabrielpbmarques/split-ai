import {
  CircuitBreaker,
  CircuitOpenError,
} from 'src/infrastructure/integration/http-client/circuit-breaker';

describe('CircuitBreaker', () => {
  let clock = 0;
  const now = (): number => clock;

  const build = (): CircuitBreaker =>
    new CircuitBreaker('test', { failureThreshold: 3, openMs: 1_000, now });

  beforeEach(() => {
    clock = 0;
  });

  it('starts closed and stays closed below the threshold', () => {
    const breaker = build();

    breaker.recordFailure();
    breaker.recordFailure();

    expect(breaker.state()).toBe('CLOSED');
    expect(() => breaker.assertCanRequest()).not.toThrow();
  });

  it('opens after the threshold and rejects requests while open', () => {
    const breaker = build();

    for (let i = 0; i < 3; i += 1) breaker.recordFailure();

    expect(breaker.state()).toBe('OPEN');
    expect(() => breaker.assertCanRequest()).toThrow(CircuitOpenError);
  });

  it('allows a single trial request once openMs elapsed', () => {
    const breaker = build();

    for (let i = 0; i < 3; i += 1) breaker.recordFailure();
    clock = 1_000;

    expect(breaker.state()).toBe('HALF_OPEN');
    expect(() => breaker.assertCanRequest()).not.toThrow();
    expect(() => breaker.assertCanRequest()).toThrow(CircuitOpenError);
  });

  it('closes again on a successful trial and re-opens on a failed one', () => {
    const breaker = build();

    for (let i = 0; i < 3; i += 1) breaker.recordFailure();
    clock = 1_000;
    breaker.assertCanRequest();
    breaker.recordSuccess();

    expect(breaker.state()).toBe('CLOSED');

    for (let i = 0; i < 3; i += 1) breaker.recordFailure();
    clock = 2_000;
    breaker.assertCanRequest();
    breaker.recordFailure();

    expect(breaker.state()).toBe('OPEN');
  });
});
