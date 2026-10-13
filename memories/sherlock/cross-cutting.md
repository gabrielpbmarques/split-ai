---
trigger: always_on
---

# Cross-cutting concerns: errors, decorators, correlation, logging, health

Owns: when a concern becomes a global mechanism, the exception filter and `ErrorResponse`, the exception table, route decorators, request correlation, logging and health routes.

## When to build a cross-cutting abstraction

<critical_rule>
A concern becomes a decorator + global mechanism (`APP_GUARD`, `APP_FILTER`, `APP_INTERCEPTOR`) only when all three hold:

1. It applies to most endpoints.
2. It is easy to forget, and forgetting it causes harm (security, error format).
3. What varies per endpoint is a declarative label (string/flag), not logic.

If any of them fails, the logic stays in the use case's controller or service.
</critical_rule>

<rules>
- A cross-cutting mechanism is registered globally, never per controller.
- Services contain no route authorization, error formatting or request logging.
- No global interceptor to shape success responses and no global pagination pipe.
- Pattern: decorator (`SetMetadata` with a constant key) → global mechanism reads it with `Reflector` (`getAllAndOverride(KEY, [handler, class])` for a single flag/object, `getAll(KEY, [handler, class])` for stackable lists).
- There is no audit interceptor or `audit_logs` table in this product; the rule set's `@AcaoAuditoria` does not apply until one is requested.
</rules>

## Global exception filter

<rules>
- `GlobalExceptionFilter` (`src/shared/http/exception.filter.ts`) is registered once in `AppModule` as `APP_FILTER`, with `@Catch()` and no argument.
- Every error response has the `ErrorResponse` shape: `{ category, code, message, status, correlationId, timestamp, path, details? }` (`src/shared/contracts/error-response.ts`).
- Conversion lives in `src/shared/http/error-mapper.ts`:
  - `HttpException` → its status and message; `code = HTTP_<status>`; `category` derived from the status; validation errors become `details` per field.
  - `ZodError` → 400, `category = VALIDATION`, `code = VALIDATION_FAILED`, `details` per field.
  - anything else → 500, `category = INTERNAL`, `code = INTERNAL_ERROR`.
- In production an unclassified 500 answers with a generic message; the real message stays in the log.
- Log: status ≥ 500 at `error` with the exception; < 500 at `warn`.
- `correlationId` comes from the request context, never from a parameter.
- A hijacked streaming reply (`QuestionController`) is outside the filter and writes its own `error` event (PC-003).
</rules>

## Exceptions

| Situation                                                   | Exception                                 | Status | Category              |
| ----------------------------------------------------------- | ----------------------------------------- | ------ | --------------------- |
| Invalid payload or input state                              | `BadRequestException`                     | 400    | `VALIDATION`          |
| Missing, invalid or expired token                           | `UnauthorizedException` (auth layer only) | 401    | `UNAUTHENTICATED`     |
| Authenticated without permission                            | `ForbiddenException`                      | 403    | `FORBIDDEN`           |
| Resource does not exist                                     | `NotFoundException`                       | 404    | `NOT_FOUND`           |
| State, uniqueness or version conflict                       | `ConflictException`                       | 409    | `CONFLICT`            |
| Precondition not met                                        | `PreconditionFailedException`             | 412    | `PRECONDITION`        |
| Upstream answered outside its contract                      | `BadGatewayException`                     | 502    | `EXTERNAL_DEPENDENCY` |
| Integration `NOT_CONFIGURED`, circuit open, dependency down | `ServiceUnavailableException`             | 503    | `UNAVAILABLE`         |
| Unexpected failure                                          | `InternalServerErrorException`            | 500    | `INTERNAL`            |

<rules>
- Never `throw new Error(...)` in request code.
- Messages in Portuguese.
- Do not create a new exception class when one in the table covers the case.
</rules>

## Route decorators

| Decorator                                | Target       | Purpose                                                          | Read by              |
| ---------------------------------------- | ------------ | ---------------------------------------------------------------- | -------------------- |
| `@Public()`                              | class/method | exempts the route from authentication and authorization          | both global guards   |
| `@RequirePermissions(...keys)`           | class/method | permissions required (keys typed from `src/auth/permissions.ts`) | `AuthorizationGuard` |
| `@User(field?)` (imported as `AuthUser`) | parameter    | injects the authenticated user or one field of it                | —                    |

<rules>
- Decorators live in `src/shared/decorators/<name>.decorator.ts`.
- Metadata keys are exported constants in `src/auth/auth.constants.ts`.
- A metadata decorator is `MethodDecorator & ClassDecorator` built with `SetMetadata`; a parameter decorator uses `createParamDecorator`.
- Implementations and semantics: `auth.md`.
</rules>

## Request correlation

<rules>
- There is a single request-context `AsyncLocalStorage` (`src/shared/observability/correlation.ts`). The logger, the exception filter and `ResilientClient` read from it.
- `request.id` reuses a valid incoming `x-request-id`, otherwise a UUID is generated; the reply returns `x-request-id`.
- `ResilientClient` propagates `x-request-id` to upstreams.
</rules>

## Logging

<example>
```ts
this.logger.warn({ agentId, bestScore }, 'rerank.below_threshold');
```
</example>

<rules>
- Use `nestjs-pino` / Nest's `Logger`. `console.*` is a lint error.
- First argument: structured fields. Second: an event name in `noun.verb` form. Do not interpolate values into the message.
- Do not pass `correlationId` manually.
- Never log tokens, the `Authorization` header, cookies, passwords, secrets, `database_url`, full integration payloads, or personal data (phone, e-mail). Redaction of auth headers is configured in `AppLoggerModule`.
- Health routes produce no request log.
</rules>

## Health

<rules>
- Three public routes with `@Public()`: `/health/startup`, `/health/live`, `/health/ready`.
- `startup`: 503 while migrations are pending.
- `live`: process only; never queries the database.
- `ready`: database, memory and per-integration state (`READY | NOT_CONFIGURED | MOCK`) from `integration.health.ts`. A `NOT_CONFIGURED` upstream does not fail readiness.
</rules>
