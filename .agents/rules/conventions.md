---
trigger: always_on
---

# Fundamental conventions

Owns: domain vs. use case, boundaries between domains, when to abstract, language, naming, comments and typing. These are the invariants most often broken when adding code under `src/`.

## Module = domain, use case = action

<rules>
- A domain module (`src/modules/<domain>/`) is a business noun: `agents`, `sources`, `sessions`.
- A use case (`<domain>/<use-case>/`) is one action in that domain, named `<verb>-<noun>`: `create-agent`, `list-sources`.
- One use case = one endpoint = one Nest module, with one controller, one service and its DTOs.
- A controller has a single handler (`handle()`); a service has a single public method (`execute()`).
- An internal auxiliary use case (no endpoint, consumed by other services) has only `<name>.service.ts` and `<name>.module.ts`: `resolve-agent`, `record-chat-message`, `load-agent-tools`.
- The only sanctioned multi-handler exception is the streaming `QuestionController`; do not replicate it.
</rules>

<structure>
```
src/modules/agents/
  agents.module.ts          aggregator: imports = exports = use-case modules
  create-agent/             create-agent.{module,controller,service,dto}.ts
  list-agents/
  load-agent-sites/         auxiliary: service + module only
  repositories/             agent.repository.ts + agent.repository.module.ts
```
</structure>

## Boundaries between domains

<critical_rule>
A domain never imports another domain's internal file (a service it does not export, an internal type, a helper). The allowed crossings are:

- a port published in `src/modules/<domain>/contracts/` (`Symbol` token + interface), e.g. `AGENT_RESOLVER`;
- an exported repository module (`AgentRepositoryModule`);
- an exported use-case module — import that module and inject the service it exports.

Never import a domain aggregator (`AgentsModule`) to reach one service inside it. Internal imports couple two domains and create circular Nest module dependencies; a cycle is broken with a port, never `forwardRef` (PC-008).
</critical_rule>

## Imports and external calls

<rules>
- Imports are absolute from `src/` (`src/modules/<domain>/...`); `./` and `../` are lint errors outside `src/infrastructure/database/schema/`.
- Repositories are imported from their own file; entities from `src/infrastructure/database/schema`; shared types from `src/shared/contracts`; ports from `src/infrastructure/integration/<name>.port`; `env` from `src/shared/config/env`.
- No SDK, `fetch` or axios under `src/modules/`. Network calls live only in `src/infrastructure/integration/<source>/` behind a port (`integrations.md`).
</rules>

## Joins across domains

<rules>
- A read may join a table owned by another domain. Prefer one join over several queries stitched together in the service.
- The method belongs to the repository of the domain that owns the `FROM` table.
- Writes (`INSERT`/`UPDATE`/soft delete) only touch the domain's own tables. To change another domain's data, call that domain's service or repository.
- Join only when the endpoint really needs both sides.
</rules>

## Abstraction

<rules>
- An interface, factory, port or extra layer exists only when there is more than one real implementation, or the implementation swaps by environment (mock vs. live).
- Otherwise inject the concrete class directly. Repositories never get an interface or token.
- Do not create a decorator, guard or mechanism without an endpoint that uses it.
- Calculation, validity or format-translation rules are pure functions with a unit spec (`src/shared/utils/<name>.ts`, one exported function per file, no classes, no I/O). A helper that needs `env` or a repository is a service, not a util.
- Implement the smallest change that satisfies the requirement. Do not refactor unrelated code.
</rules>

## Language

This repository deliberately deviates from the rule set's "domain language identifiers" because 400+ files and external clients already use English names.

<rules>
- English: folders, files, classes, methods, columns, tokens, log event names.
- Portuguese: exception messages, validation messages, Swagger descriptions, prompt text and tool descriptions shown to the LLM.
- Names state the business action. Avoid `ProcessData`, `Manager`, `Helper`, `Util` or a generic `Handler`.
</rules>

## Naming

| Role                       | File                                                                         | Class / symbol                        |
| -------------------------- | ---------------------------------------------------------------------------- | ------------------------------------- |
| Use-case module            | `create-agent.module.ts`                                                     | `CreateAgentModule`                   |
| Domain aggregator          | `agents.module.ts`                                                           | `AgentsModule`                        |
| Controller                 | `create-agent.controller.ts`                                                 | `CreateAgentController`               |
| Service                    | `create-agent.service.ts`                                                    | `CreateAgentService`                  |
| DTO                        | `create-agent.dto.ts`                                                        | `CreateAgentDto`                      |
| Repository                 | `repositories/agent.repository.ts`                                           | `AgentRepository`                     |
| Repository module          | `repositories/agent.repository.module.ts`                                    | `AgentRepositoryModule`               |
| Entity                     | `infrastructure/database/schema/agent.entity.ts`                             | `AgentEntity`                         |
| Shared type                | `shared/contracts/models/<name>.model.ts`                                    | types/interfaces                      |
| Port                       | `<name>.port.ts`                                                             | `VECTOR_STORE` + `VectorStoreGateway` |
| Integration adapter        | `<source>-<port>.gateway.ts`, `<source>.contracts.ts`, `<source>.mappers.ts` | `SupabaseVectorStoreGateway`          |
| Health indicator           | `database.health.ts`                                                         | —                                     |
| Guard / filter / decorator | `*.guard.ts` / `*.filter.ts` / `*.decorator.ts`                              | —                                     |
| Migration                  | `<timestamp>-<kebab-name>.ts`                                                | `<PascalName><timestamp>`             |
| Unit / e2e spec            | `*.spec.ts` next to the file / `test/<domain>.e2e-spec.ts`                   | —                                     |

<rules>
- Files and folders: kebab-case. Columns and DTO fields that map a column: snake_case. Variables and methods: camelCase. Port tokens: UPPER_SNAKE_CASE `Symbol`.
- Use-case verbs: create, list, get, update, delete, generate, process, resolve, load, record, convert.
- Repository methods are named by intent: `findByIdOrIdentifier`, `listByAgentPaginated`, `softDelete`.
- Permission keys: `<resource>.<action>` (`agent.write`), typed from `src/auth/permissions.ts`.
- Interfaces have no `I` prefix. `public` is omitted; `private`/`protected` are explicit.
</rules>

## Comments

<rules>
- Write no comments in code; `bun run lint` fails on any comment under `src/` (directives aside).
- What would need a comment becomes a better name or a smaller function. Test intent goes in the `it(...)` text. Domain knowledge that does not fit in a name goes to `docs/decisoes-de-dominio.md`.
</rules>

## Typing

<rules>
- `strict` and `noImplicitOverride` are on. `noUncheckedIndexedAccess` and `isolatedModules` are off on purpose (PC-014).
- No `any` outside specs: use `unknown`, `Record<string, unknown>`, `Pick<>` or an interface.
- Type-only imports use `import type` or inline `type`. A class injected through a constructor without `@Inject(TOKEN)` keeps a value import — `import type` erases it and DI breaks at runtime with no compile error. Let `consistent-type-imports` decide; never hand-write `import type` on those.
- Every public method declares its return type.
- Entities and DTOs use `!` for required fields (`strictPropertyInitialization`). Elsewhere, never use the non-null assertion to silence a nullable value; narrow it or throw.
- The three accepted casts are listed in `CLAUDE.md` ("Three deliberate casts"); anything else needs a PC entry.
</rules>
