export type ErrorCategory =
  | 'VALIDATION'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'PRECONDITION'
  | 'RATE_LIMITED'
  | 'EXTERNAL_DEPENDENCY'
  | 'UNAVAILABLE'
  | 'INTERNAL';

export interface ErrorDetail {
  readonly field: string;
  readonly message: string;
}

export interface ErrorResponse {
  readonly category: ErrorCategory;
  readonly code: string;
  readonly message: string;
  readonly status: number;
  readonly correlationId: string;
  readonly timestamp: string;
  readonly path: string;
  readonly details?: readonly ErrorDetail[];
}
