---
name: import-and-naming-conventions
description: 'Use for imports (barrel vs direct), file/class/method naming and suffixes, casing conventions, choosing the right NestJS exception, organizing src/utils functions, and Conventional Commit formatting.'
---

### Import conventions

- **Repositories**: Import from `src/repositories/<name>.repository` (specific files) — NOT from the barrel `src/repositories/index.ts` in services.
- **Entities**: Import from `src/entities` (barrel) or specific entity files.
- **Types/Models**: Import from `src/types` (barrel) or `src/types/models/<name>.model`.
- **Infrastructure tokens**: Import from `src/infrastructure/providers/<name>.provider`.
- **Decorators**: Import `User` as `AuthUser` in controllers to avoid conflict with the `User` type:

```typescript
import { User as AuthUser } from 'src/decorators/user.decorator';
import { User } from 'src/types/models/user.model';
```

- **Use absolute paths** (`src/...`) for cross-module imports, **relative paths** (`./`, `../`) for same-module imports.

## Naming Conventions

### Files

All files use **kebab-case**: `create-order.service.ts`, `login.dto.ts`, `user.repository.ts`.

File suffixes:

- `.module.ts` — NestJS module
- `.controller.ts` — REST controller
- `.service.ts` — Business logic service
- `.dto.ts` — Data Transfer Object
- `.entity.ts` — TypeORM entity
- `.repository.ts` — Repository wrapper
- `.gateway.ts` — WebSocket gateway
- `.guard.ts` — NestJS guard
- `.middleware.ts` — NestJS middleware
- `.provider.ts` — Infrastructure provider
- `.model.ts` — Type/interface definition
- `.decorator.ts` — Custom decorator
- `.spec.ts` — Unit test

### Classes

All classes use **PascalCase** with a descriptive suffix:

- `CreateOrderService`, `LoginController`, `UserRepository`, `OrderEntity`

### Variables and methods

- **camelCase** for all variables and method names.
- **snake_case** for database column names and DTO properties that map to database fields (e.g., `user_id`, `device_fingerprint`, `created_at`).
- **UPPER_SNAKE_CASE** for injection tokens and constants (e.g., `PAYMENT_GATEWAY_CLIENT`, `EMAIL_SERVICE`).

### Method naming

| Context                  | Name                                               | Notes                                               |
| ------------------------ | -------------------------------------------------- | --------------------------------------------------- |
| Service main method      | `execute`                                          | Always                                              |
| Controller handler       | `handle`                                           | Preferred, `execute` also acceptable                |
| Private helper methods   | Descriptive camelCase                              | e.g., `checkResourceBelongsToUser`, `formatPayload` |
| Repository query methods | `findBy*`, `findAll`, `create`, `update`, `delete` | Domain-oriented naming                              |

## Utility Functions

Utilities in `src/utils/` are **pure exported functions** (not classes, not injectable):

```typescript
export function formatCreatedAt(createdAt: Date): string {
  // ...
}
```

Or as arrow functions:

```typescript
export const getUrlBuffer = async (url: string): Promise<Buffer> => {
  // ...
};
```

Rules:

- One utility per file, named after the function.
- No classes — just plain exported functions.
- Purpose: reduce code duplication across services.

## Error Handling Philosophy

1. **Use NestJS built-in exceptions** — they carry the correct HTTP status:
   - `BadRequestException` (400)
   - `UnauthorizedException` (401)
   - `ForbiddenException` (403)
   - `NotFoundException` (404)
   - `ConflictException` (409)
   - `InternalServerErrorException` (500)

2. **Error messages in the project's default language** (e.g., Portuguese) for user-facing messages (e.g., `'Credenciais inválidas'`, `'Recurso não encontrado'`).
3. **Early return on errors** — validate and throw at the top of the method, then proceed with the happy path.
4. **Don't catch exceptions in services** — let them bubble up to the controller's try/catch.

## Code Style Principles

1. **Avoid redundancy**: Don't check for conditions that are guaranteed by the caller/guard chain. If `AuthGuard` guarantees `user` exists on the request, don't add `if (!user)` in the service.
2. **Lean services**: Push data processing into repository queries whenever possible. Prefer a single optimized query over fetching data and processing it in TypeScript.
3. **Early return over nesting**: Validate preconditions at the top and return/throw early to keep the main logic flat.
4. **Prefer Promise.all/Promise.allSettled**`Promise.all``Promise.allSettled` for independent async operations instead of sequential awaits.
5. `readonly`**readonly on all constructor dependencies**: Always use `private readonly` for injected dependencies.
6. **No unnecessary comments**: Code should be self-explanatory. Comments are reserved for non-obvious business rules or workarounds.
7. **TypeScript strict-ish**: The project uses `strictNullChecks: false` and `noImplicitAny: false`, but write type-safe code where practical.

## Infrastructure Service Injection

When a service needs an external provider from `InfrastructureModule`:

```typescript
import { Inject } from '@nestjs/common';
import {
  EMAIL_SERVICE,
  IEmailService,
} from 'src/infrastructure/providers/email.provider';

@Injectable()
export class SendNotificationService {
  constructor(
    @Inject(EMAIL_SERVICE)
    private readonly emailService: IEmailService,
  ) {}
}
```

- Use the **injection token** (`EMAIL_SERVICE`) with `@Inject()`.
- Import the **interface** (`IEmailService`) for typing.
- The module imports `InfrastructureModule` as a whole.

## Commit Convention

The project uses **Conventional Commits** enforced by `commitlint`:

```
<type>: <description>
```

Allowed types: `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, `test`.

## Linting and Formatting

- **ESLint** + **Prettier** enforced via `lint-staged` on pre-commit.
- Prettier formats all `.ts`, `.js`, `.json`, `.md`, `.yml` files.
- Spec files (`*.spec.ts`) are excluded from ESLint in pre-commit.

## Rules — NEVER Violate

1. **One endpoint per controller** — never add multiple HTTP handlers to a single controller.
2. **Service main method is execute**`execute` — never use other names for the primary public method.
3. **Controller handler is handle or execute**`handle``execute` — use one of these names consistently.
4. **Always use @Res() with FastifyReply**`@Res()``FastifyReply` — never rely on NestJS default response handling.
5. **Always validate with ValidationPipe**`ValidationPipe` — never accept unvalidated request bodies.
6. **Always use early return** — validate and throw at the top, keep the happy path flat.
7. **No redundant safety checks** — trust the guard/decorator chain.
8. **No business logic in controllers** — controllers only call `service.execute()` and format the HTTP response.
9. **Use private readonly for all injected dependencies**`private readonly`.
10. **Error messages in the project's default language** for user-facing responses.
