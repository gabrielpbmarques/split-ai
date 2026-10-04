---
paths:
  - 'src/**/*.ts'
---

# Scoped rule — `src/` (scaffolding)

Thin path-scoped reminder. The canonical rules are the **Hard rules**, **Service & reasoning conventions**, and naming/import conventions in the root `CLAUDE.md`. For depth and templates, open the skills: `architecture`, `code-patterns`, `import-and-naming-conventions`.

Most-violated invariants when adding code under `src/`:

- **One use case = one module = one controller = one endpoint.** Controller handler is `handle` (or `execute`); the service's single public method is `execute`.
- **Wire the scope-module chain, or the endpoint 404s silently.** A new use-case module must be imported in its scope module, and the scope module imported in `ComponentsModule`. A module that compiles but isn't chained never registers its route — no error, just a missing endpoint. Scope modules are **wiring only** (imports, no `providers`/`controllers`/`exports`) — don't re-add an `exports` array to one.
- **A module imports exactly what its own classes inject — nothing more.** One repository → `XRepositoryModule` (`src/repositories/<name>.repository.module.ts`); one infra token → `XProviderModule` (`src/infrastructure/providers/<name>.provider.module.ts`); one sibling service → that use case's own module. **Never** import a scope aggregator (`ArtificialIntelligenceModule`, `SessionModule`, `PdfModule`, …) to reach one service inside it. `RepositoriesModule` and `InfrastructureModule` no longer exist.
- **Count the guards too.** A module's `imports` must also cover what its `@UseGuards(...)` enhancers inject — e.g. a controller under `CompositeAuthGuard` needs `ApiKeyGuard`'s `ApiKeyRepositoryModule` + `OrganizationRepositoryModule` in that module.
- **Cycles need `forwardRef` on both sides** (`ResolveAgentModule` ↔ `LoadAgentToolsModule`, `AppendConnectionToolsModule` ↔ `InvokeConnectedAgentModule`) — in the `imports` array _and_ on the `@Inject(forwardRef(() => XService))` parameter.
- **In services, import a repository from its own file** (`src/repositories/<name>.repository`), never from the barrel `src/repositories/index.ts` — the barrel is for module wiring and risks circular imports.
- **Controllers** use `@Res() res: FastifyReply`, return `res.status(<code>).send(result)`, have **no try/catch** (errors go to `GlobalExceptionFilter` → `ErrorResponse`), throw Nest exceptions for request-level checks, and contain **no business logic**. Only `QuestionController` (streaming) keeps its own catch.
- **Query-param DTOs** are plain `@Query() dto: XDto` (the global pipe transforms) — numeric fields need `@Type(() => Number)` or they stay strings.
- **The `ValidationPipe` is global** (`createValidationPipe()`: whitelist + forbidNonWhitelisted + forbidUnknownValues, no implicit conversion) — every DTO field needs a class-validator decorator or it is stripped/rejected; numeric query fields need `@Type(() => Number)`. **No global `/api` prefix** — routes mount at each `@Controller(...)` path. (The `architecture` skill's directory sketch is generic NestJS; the real scopes are `AIChat`, `ArtificialIntelligence`, `Tools`, `Organization`, `Source`, `Session`, `Credits`, `Payment`, `Whatsapp`, `OCR`, etc.)
- **New entity →** barrel-export it from `src/entities/index.ts` **and** give its repository a sibling `<name>.repository.module.ts` (`TypeOrmModule.forFeature([XEntity])` + `providers`/`exports: [XRepository]`). `forFeature` is module-local — importing a module that registered an entity does _not_ hand you its `Repository<T>`.
- **After touching module wiring, run `bun run di:verify`** (`scripts/refactor-di/verify.ts`): it reports any injection a module's `imports` no longer reach and any controller unreachable from `AppModule`. `bun run di:boot-check` compiles the whole Nest container with the DataSource stubbed — same errors Nest would raise at boot, without a database.
- **User-facing messages in Portuguese; identifiers in English.**
