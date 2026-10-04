---
name: import-and-naming-conventions
description: 'Use for imports (absolute from src/, barrel vs direct, import type), file/class/method naming and suffixes, casing, picking the Nest exception, organizing src/shared/utils, and Conventional Commits. The delta over rule 02 of ai-agents-engineering.'
---

Rule `02-convencoes-fundamentais.md` owns the conventions; this is how they look in this repository.

## Imports

- Absolute from `src/` everywhere (`import { X } from 'src/modules/...'`); `./` and `../` are lint errors outside `src/infrastructure/database/schema/`.
- Order is enforced by `import/order`: builtin → external → `src/…`, alphabetized, blank line between groups. `bun run lint:fix` sorts them.
- Type-only imports use `import type` or inline `type` (`consistent-type-imports` + `no-import-type-side-effects`). The rule itself keeps a value import for a class injected through a decorated constructor; never hand-write `import type` on those (PC-014).
- Repositories from their file: `src/modules/<domain>/repositories/<name>.repository` (no barrel). Entities from `src/infrastructure/database/schema` (barrel) or the entity file. Shared types from `src/shared/contracts` (barrel). Integration ports from `src/infrastructure/integration/<name>.port` (token + interface). `env` from `src/shared/config/env`.
- `@User` is imported as `AuthUser` in controllers (`import { User as AuthUser } from 'src/shared/decorators/user.decorator'`) and the parameter is typed `AuthenticatedUser` from `src/auth/authenticated-user`.

## Names

| Item | Form | Example |
| --- | --- | --- |
| Folder | kebab-case, use case = `<verb>-<noun>` | `src/modules/agents/create-agent/` |
| File | kebab-case + suffix | `create-agent.service.ts`, `agent.repository.module.ts`, `stripe-payments.gateway.ts`, `stripe.contracts.ts`, `stripe.mappers.ts`, `payments.port.ts`, `sql-guard.ts` |
| Class | PascalCase + suffix | `CreateAgentService`, `CreateAgentController`, `CreateAgentDto`, `CreateAgentModule`, `AgentRepository`, `AgentEntity`, `StripePaymentsGateway` |
| Port token | UPPER_SNAKE_CASE `Symbol` | `PAYMENTS`, `VECTOR_STORE`, `AGENT_RESOLVER` |
| Port interface | PascalCase, suffix by role | `PaymentsGateway`, `ChatModelFactory`, `SiteCrawler`, `AgentResolver` |
| Permission | `<resource>.<action>` | `agent.write`, `member.manage` |
| Column / DTO field mapping a column | snake_case | `organization_id`, `chat_embed_token` |
| Variable / method | camelCase | `requireOrganizationId` |
| Controller handler / service method | `handle` / `execute` | always |
| Repository methods | named by intent | `findByIdOrIdentifierWithOrganization`, `listSummariesPaginated`, `countByOrganization`, `softDelete` |
| Migration file | `<timestamp>-<kebab-name>.ts`, class `<PascalName><timestamp>` | `1759600000000-add-lifecycle-columns.ts` |
| Spec | next to the file, `.spec.ts`; e2e `test/<domain>.e2e-spec.ts` | `sql-guard.spec.ts`, `test/agents.e2e-spec.ts` |

Identifiers are English; user-facing strings (exceptions, Swagger descriptions, prompt text) are Portuguese.

## Exceptions

`BadRequestException` (400, format/business rule), `UnauthorizedException` (401, only in auth), `ForbiddenException` (403, permission/scope/quota), `NotFoundException` (404), `ConflictException` (409, duplicates), `ServiceUnavailableException` (503, integration `NOT_CONFIGURED`), `BadGatewayException` (502, upstream answered outside its contract). Thrown at the top of `execute`, never caught in services or controllers.

## Utils

`src/shared/utils/<name>.ts`: one pure exported function per file, named after the function, no classes, no I/O. A util that needs `env` or a repository is a service, not a util.

## Commits

Conventional Commits enforced by commitlint: `<type>: <subject>` with `build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test`, lowercase subject, no trailing period, blank line before the body.
