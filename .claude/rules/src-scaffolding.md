---
paths:
  - 'src/**/*.ts'
---

# Scoped rule — `src/` (scaffolding)

Thin path-scoped reminder. The canonical rules are the **Hard rules**, **Service & reasoning conventions**, and naming/import conventions in the root `CLAUDE.md`. For depth and templates, open the skills: `architecture`, `code-patterns`, `import-and-naming-conventions`.

Most-violated invariants when adding code under `src/`:

- **One use case = one module = one controller = one endpoint.** Controller handler is `handle` (or `execute`); the service's single public method is `execute`.
- **Wire the domain-module chain, or the endpoint 404s silently.** A new use-case module must be listed in both `imports` and `exports` of `src/modules/<domain>/<domain>.module.ts`; the aggregator is already imported by `AppModule`. A module that compiles but isn't chained never registers its route — no error, just a missing endpoint. Aggregators are **wiring only** (no `providers`/`controllers`).
- **A module imports exactly what its own classes inject — nothing more.** One repository → `XRepositoryModule` (`src/modules/users/repositories/<name>.repository.module.ts`); one sibling service → that use case's own module. **External integrations need no import**: their ports (`PAYMENTS`, `VECTOR_STORE`, `EMAIL`, `CHAT_MODEL`, … in `src/infrastructure/integration/<name>.port.ts`) come from the `@Global()` `IntegrationModule`; inject by token, type by interface. **Never** import a domain aggregator (`AgentsModule`, `SessionsModule`, …) to reach one service inside it. `RepositoriesModule`, `InfrastructureModule` and the per-SDK `XProviderModule`s no longer exist.
- **No SDK, `fetch` or `axios` under `src/modules/`.** Network calls live only in `src/infrastructure/integration/<source>/` behind a port; external field names only in `<source>.contracts.ts` / `<source>.mappers.ts`. A new upstream gets contract + mapper (+ spec) + live gateway + mock, registered in `integration.module.ts`.
- **Auth is global, never per controller.** No `@UseGuards` (except `ThrottlerGuard` on SMS). Every handler has `@Public()` or `@RequirePermissions('<resource>.<action>')` (keys typed from `src/auth/permissions.ts`); add `@RequireActiveOrganization()` for chat/conversation routes. Ownership checks go through `AccessScopeService.ensureCan(...)` in the service (module imports `AuthModule`).
- **No `forwardRef`, no module cycles.** The only back-edge in the AI pipeline (`InvokeConnectedAgent` → `ResolveAgent`) goes through the `AGENT_RESOLVER` port (`src/modules/agent-runtime/contracts/`), published by the `@Global()` `AgentRuntimeContractsModule` with a lazy `ModuleRef` lookup. A new cycle gets a port, not a `forwardRef`.
- **Imports are absolute from `src/`** (`src/modules/<domain>/...`); `./` and `../` are lint errors.
- **Repositories are imported from their own file** (`src/modules/<domain>/repositories/<name>.repository`); there is no repositories barrel.
- **Controllers** use `@Res() res: FastifyReply`, return `res.status(<code>).send(result)`, have **no try/catch** (errors go to `GlobalExceptionFilter` → `ErrorResponse`), throw Nest exceptions for request-level checks, and contain **no business logic**. Only `QuestionController` (streaming) keeps its own catch.
- **Query-param DTOs** are plain `@Query() dto: XDto` (the global pipe transforms) — numeric fields need `@Type(() => Number)` or they stay strings.
- **The `ValidationPipe` is global** (`createValidationPipe()`: whitelist + forbidNonWhitelisted + forbidUnknownValues, no implicit conversion) — every DTO field needs a class-validator decorator or it is stripped/rejected; numeric query fields need `@Type(() => Number)`. **No global `/api` prefix** — routes mount at each `@Controller(...)` path. (The `architecture` skill's directory sketch is generic NestJS; the real scopes are `AIChat`, `ArtificialIntelligence`, `Tools`, `Organization`, `Source`, `Session`, `Credits`, `Payment`, `Whatsapp`, `OCR`, etc.)
- **New entity →** barrel-export it from `src/infrastructure/database/schema/index.ts` **and** give its repository a sibling `<name>.repository.module.ts` (`TypeOrmModule.forFeature([XEntity])` + `providers`/`exports: [XRepository]`). `forFeature` is module-local — importing a module that registered an entity does _not_ hand you its `Repository<T>`.
- **After touching module wiring, run `bun run di:verify`** (`scripts/refactor-di/verify.ts`): it reports any injection a module's `imports` no longer reach and any controller unreachable from `AppModule`. `bun run di:boot-check` compiles the whole Nest container with the DataSource stubbed — same errors Nest would raise at boot, without a database.
- **User-facing messages in Portuguese; identifiers in English.**
