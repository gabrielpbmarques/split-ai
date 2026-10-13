export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  readonly failureThreshold: number;
  readonly openMs: number;
  readonly now?: () => number;
}

export class CircuitOpenError extends Error {
  constructor(name: string) {
    super(`Circuito aberto para ${name}`);
    this.name = 'CircuitOpenError';
  }
}

export class CircuitBreaker {
  private failures = 0;
  private openedAt?: number;
  private halfOpenInFlight = false;
  private readonly now: () => number;

  constructor(
    readonly name: string,
    private readonly options: CircuitBreakerOptions,
  ) {
    this.now = options.now ?? Date.now;
  }

  state(): CircuitState {
    if (this.openedAt === undefined) {
      return 'CLOSED';
    }

    return this.now() - this.openedAt >= this.options.openMs
      ? 'HALF_OPEN'
      : 'OPEN';
  }

  assertCanRequest(): void {
    const state = this.state();

    if (state === 'OPEN') {
      throw new CircuitOpenError(this.name);
    }

    if (state === 'HALF_OPEN') {
      if (this.halfOpenInFlight) {
        throw new CircuitOpenError(this.name);
      }

      this.halfOpenInFlight = true;
    }
  }

  recordSuccess(): void {
    this.failures = 0;
    this.openedAt = undefined;
    this.halfOpenInFlight = false;
  }

  recordFailure(): void {
    this.halfOpenInFlight = false;
    this.failures += 1;

    if (
      this.openedAt !== undefined ||
      this.failures >= this.options.failureThreshold
    ) {
      this.openedAt = this.now();
    }
  }
}
