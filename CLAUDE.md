# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About this project

`split-ai` is a **personal AI engine**: a NestJS 11 + Fastify 5 backend for chat agents, OCR, source ingestion, voice and WhatsApp. It used to be a commercial multi-tenant product; organizations, members, API keys, billing (Stripe, plans, credits), the embeddable widget, self-service sign-up/SMS login and the BravoHub integration were removed on purpose. There is **one deployment, a handful of users and no tenants** — do not reintroduce tenant scoping, quotas or billing without an explicit request.

The AI pipeline is built on LangChain / LangGraph with Anthropic Claude models for chat and Voyage AI for retrieval — `voyage-3-large` (1024 dims) for embeddings and `rerank-2.5` as a cross-encoder reranker; vector storage in Supabase/pgvector, and PostgreSQL (also on Supabase) as the primary store via TypeORM.

It lives inside `bravohub-analytics-workspace/`, but it is independent of the BravoHub products: no shared database, no shared auth contract. The workspace `CLAUDE.md` one level up does not apply here.

## The specification: `.claude/rules/` and `.claude/skills/`

The architecture of this repository is the backend rule set originally written in `gabrielpbmarques/ai-agents-engineering` (`docs/backend/rules/`), **translated to English and adapted to this repo** (TypeORM, bun, Jest, English identifiers, no tenants). The adapted copy is the source of truth; you do not need the sibling repository.

| Where                                                                                    | Owns                                                                                               | Loads                                                               |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `.claude/rules/topology.md`                                                              | `src/` layout, `main.ts` boot order, `env.ts`, imports, tooling, verification checklist            | `main.ts`, `app.module.ts`, `shared/config/**`, config files        |
| `.claude/rules/conventions.md`                                                           | domain vs. use case, boundaries, abstraction, language, naming, comments, typing                   | any `src/**/*.ts`                                                   |
| `.claude/rules/nest-modules.md`                                                          | the three module roles, aggregators, `@Global()`, DI mechanism choice, ports                       | `*.module.ts`, `*.port.ts`, `contracts/**`                          |
| `.claude/rules/use-cases.md`                                                             | request flow, controller / service / DTO rules, use-case recipe                                    | `*.controller.ts`, `*.service.ts`, `*.dto.ts`                       |
| `.claude/rules/database.md`                                                              | entities, soft delete, repositories, projection/listing, transactions, migrations                  | `infrastructure/database/**`, `repositories/**`                     |
| `.claude/rules/cross-cutting.md`                                                         | exception filter, `ErrorResponse`, exception table, decorators, correlation, logging, health       | `shared/http/**`, `shared/decorators/**`, `shared/observability/**` |
| `.claude/rules/auth.md`                                                                  | guards, `TokenVerifier`, permission catalog, why there is no resource scope                        | `auth/**`, `auth-flows/**`                                          |
| `.claude/rules/integrations.md`                                                          | gateway → Zod contract → mapper, mock mode, `ResilientClient`, `CUSTOMER_DATABASE`                 | `infrastructure/integration/**`                                     |
| `.claude/rules/tests.md`                                                                 | unit vs. e2e layers, harness, what a good test is                                                  | `test/**`, `*.spec.ts`                                              |
| `.claude/rules/ai-agent.md`, `agent-tools.md`, `aichat-streaming.md`, `rag-ingestion.md` | AI pipeline invariants                                                                             | their module paths                                                  |
| skill `new-feature-flow`                                                                 | **how to implement a feature**: 18 questions, plan format, implementation order, closing checklist | on demand                                                           |
| skill `known-problems`                                                                   | protocol and template for the `PC-NNN` register in `docs/problemas-conhecidos.md`                  | on demand                                                           |

**New feature = `new-feature-flow` first.** Answer its questions, write the plan in its format, show it to the requester, then implement in its order (schema → types → modules → use cases → tests → verification). `.github/pull_request_template.md` carries its closing checklist.

**Hit an error or library quirk = `known-problems` first.** `grep` the register before investigating; register the outcome afterwards.

## Conscious deviations from the original rule set

| Topic                                          | Rule set                                      | Decision here                                                                                | Why                                                             |
| ---------------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| ORM                                            | Drizzle + `pg`                                | **TypeORM 0.3**, `EntityManager` as `tx`, `migration:generate`                               | entities and `PostgresSaver` already on `pg`; rewrite ruled out |
| Package manager                                | pnpm                                          | **bun** (`bun.lock`, Dockerfile, CI)                                                         |                                                                 |
| Tests                                          | Vitest + Testcontainers                       | **Jest** (`ts-jest`); e2e against `TEST_DATABASE_URL`, Testcontainers only as local fallback |                                                                 |
| Identity                                       | Resource Server, external IdP                 | this app **issues** HS256 JWTs at `/auth/login` (PC-001)                                     | no IdP for a personal engine                                    |
| Identifiers                                    | domain language                               | **English** identifiers, Portuguese user-facing messages and Swagger                         | existing code and clients                                       |
| Global prefix                                  | `app.setGlobalPrefix(env.API_PREFIX)`         | **none**                                                                                     | Cloud Run health and clients depend on current paths            |
| Permissions                                    | `roles`/`permissions` tables                  | **derived from the role** in `src/auth/permissions.ts`                                       | no need for per-user grants                                     |
| Resource scope                                 | `AccessScopeService` on third-party resources | **not implemented**: no tenants, staff act on everything                                     | see `auth.md` for when to bring it back                         |
| Audit trail                                    | `@AuditAction` + `audit_logs`                 | **not implemented**                                                                          | not needed yet                                                  |
| `INTEGRATION_MODE` default                     | `mock`                                        | `mock` only when `NODE_ENV=test`, `live` otherwise                                           | dev `.env` files carry real keys                                |
| `ResilientClient` everywhere                   | every external call                           | only hand-written HTTP (Voyage rerank); SDKs keep their stack (PC-013)                       |                                                                 |
| `isolatedModules` / `noUncheckedIndexedAccess` | on                                            | **off** (PC-014; 82 legitimate indexings)                                                    |                                                                 |
| Baseline migration                             | required                                      | none; migrations are deltas over the production schema (PC-017)                              | production schema predates migrations                           |

## Package manager

**Use `bun`.** The lockfile is `bun.lock`, the Dockerfile uses `bun`, and CI runs `bun install` then `format:check`, `lint`, `typecheck`, `test`, `test:e2e` and `build`. The `package.json` scripts call `nest`/`jest` directly so they work under either runtime, but stay on bun to keep the lockfile honest.

## Commands

```bash
bun install                                 # install deps
bun run start:dev                           # watch mode (default port 4000)
bun run start:prod                          # run compiled dist/main
bun run build                               # nest build → dist/
bun run lint                                # eslint + lint:comments (check only; CI runs this)
bun run lint:fix                            # eslint --fix
bun run lint:comments --fix                 # strip comments under src/
bun run typecheck                           # tsc --noEmit
bun run format:check                        # prettier --check
bun run test                                # jest (unit + pure-function specs under src/)
TEST_DATABASE_URL=postgres://postgres@127.0.0.1:5432/split_ai_test bun run test:e2e   # e2e (needs a Postgres; see Tests)
bun run test:cov                            # coverage
bun jest src/path/to/file.spec.ts           # single file
bun jest -t "test name fragment"            # single test by name
bun run di:verify && bun run di:boot-check  # module wiring: static reachability + real Nest container (DataSource stubbed)
bun run db:generate src/infrastructure/database/migrations/<timestamp>-<name>   # against a DB mirroring production
bun run db:check | db:migrate | db:revert | db:show
bun run repair:thread <threadId>            # delete a poisoned LangGraph checkpoint thread
docker compose up                           # api + local Redis + Postgres (for e2e)
```

The dev server defaults to **port 4000** (`PORT` default in `src/shared/config/env.ts`).

## Architecture in one screen

```
src/
  main.ts                    Fastify bootstrap (createFastifyAdapter, global pipe, pino, Swagger)
  app.module.ts              Root — AppLoggerModule, TypeOrmModule.forRoot(ENTITIES, MIGRATIONS), IntegrationModule,
                             AuthModule, HealthModule, one aggregator module per domain
  auth/                      Global guards, TokenVerifier, PrincipalResolverService, permissions, request-user.ts
  infrastructure/
    database/schema/         TypeORM entities + barrel exporting ENTITIES (the only place tables are declared)
    database/migrations/     MIGRATIONS (run by the CI `migrate` job, never at boot); data-source.ts for the CLI
    database/transaction-executor/   TransactionExecutor.run(async (tx) => …)
    integration/             The ONLY place that talks to an external service:
      integration.module.ts  @Global() — publishes every port below (mock or live per INTEGRATION_MODE)
      <name>.port.ts         Symbol token + interface: MESSAGING, EMBEDDINGS, VECTOR_STORE, RERANKER, CHAT_MODEL,
                             SITE_CRAWLER, FILE_STORAGE, TEXT_TO_SPEECH, OCR, CUSTOMER_DATABASE
      http-client/           ResilientClient (timeout, retry+backoff, circuit breaker, SSRF guard, correlation)
      <source>/              twilio, supabase, voyage, anthropic, spider, google, eleven-labs, customer-database:
                             <source>.contracts.ts, <source>.mappers.ts (+ spec), <source>-<port>.gateway.ts
      mock/                  In-memory implementation of every port (INTEGRATION_MODE=mock, default in tests)
      integration.health.ts  Per-upstream state (READY | NOT_CONFIGURED | MOCK) reported by /health/ready
  modules/<domain>/          agents, agent-connections, agent-runtime, retrieval, chat, sessions, sources, reports,
                             users, auth-flows, voice, whatsapp
    <domain>.module.ts       Aggregator: imports + exports the use-case modules, nothing else
    <use-case>/              One use case = one module = one controller = one endpoint (kebab-case files)
    repositories/            <name>.repository.ts + <name>.repository.module.ts (forFeature + provides/exports)
    contracts/               Ports published to other domains, when needed (AGENT_RESOLVER)
  shared/
    config/env.ts            Zod-validated, frozen `env` object — the ONLY place that reads process.env
    contracts/               Shared TS types + barrel, ErrorResponse, pagination (PageRequest/PageResult/toPaginatedResponse)
    decorators/              @Public, @RequirePermissions, @User
    http/                    Fastify adapter factory, validation pipe, exception filter, error mapper, pagination.dto, health/
    observability/           correlation (AsyncLocalStorage), pino logger module, Sentry init
    utils/                   Pure helper functions, kebab-case
scripts/refactor-di/         di:verify / di:boot-check      scripts/lint/no-comments.ts     scripts/test/prepare-database.ts
test/                        e2e per domain + support/ (test-app, factories, database) + global-setup
```

## Product-specific invariants (what the rules do not say)

- **`AuthenticatedUser`** is `{ id, name, email, phone, role, permissions }`; `id` is always a real user id. Roles are `admin` (owner: everything, including `agent.manage` and `user.manage`), `user` (trusted operator: agents, connections, sources, sessions, reports, analytics, voice, user read) and `guest` (`account.access` + chat). Catalog: `src/auth/permissions.ts`.
- **`TokenVerifier`** (`src/auth/token.verifier.ts`) accepts only `Authorization: Bearer <HS256 JWT>` signed with `env.JWT_SECRET` (issued by `GenerateTokenService` at `POST /auth/login`). Users are created by an admin through `POST /user`; there is no public sign-up. WhatsApp senders are auto-created as users by the webhook.
- **Pagination**: list query DTOs extend `PaginationDto`; repositories return `PageResult`; services return `toPaginatedResponse()` → `{ items, total, totalPages, page, limit }`. Listing methods take `fields?: readonly K[]` before `tx?` and return `Pick<Entity, K>[]`.
- **Transactions** live in services (`TransactionExecutor.run`), `tx` is the last argument of every repository write; used by `CreateAgent` and `UpdateAgent`. External effects run after the commit.
- **Soft delete everywhere**; unique indexes are partial (`WHERE "deleted_at" IS NULL`); raw `from('table')` subqueries must filter `deleted_at` themselves.
- **No global API prefix.** Health at `/health/startup` (503 while migrations are pending), `/health/live`, `/health/ready` (database + memory + per-integration state). Swagger at `/docs` only with `SWAGGER_ENABLED=true` outside production.
- **Bootstrap order is fixed** (`src/main.ts`): `dotenv/config` → `createFastifyAdapter()` (helmet, multipart, `x-request-id` correlation) → pino (`AppLoggerModule`, redacts auth headers) → CORS from `ALLOWED_ORIGINS` (empty = reflect any origin; `*` rejected) → global pipe → shutdown hooks → Swagger → listen. Helmet runs with its defaults plus COEP `require-corp` (CSP, `X-Frame-Options`, CORP/COOP `same-origin`). CORS allows only `ALLOWED_ORIGINS` (`.env.example`: the local maia apps on ports 3000/4200); an empty value still reflects any origin, so set it wherever the API is deployed. `DevtoolsModule` is skipped under `NODE_ENV=test` (PC-018).
- **`env.ts` is the only reader of `process.env`**; new variable → Zod schema **and** `.env.example`. Never paste secret values into messages or commits.
- **Lint beyond the rules**: `import/order` (builtin → external → `src/…`), `check-file` kebab-case, `no-restricted-imports` for `./` `../` (schema folder excepted), `no-console`, `no-inline-comments`, `no-warning-comments`, `consistent-type-imports` (keeps value imports for decorated constructor params — never hand-write `import type` on those), `no-explicit-any` (specs excepted), and `scripts/lint/no-comments.ts` as the last step of `bun run lint`. Knowledge that used to live in comments is in `docs/decisoes-de-dominio.md`.
- **Three deliberate casts**: TypeORM `update()` payloads (`as QueryDeepPartialEntity<Entity>`, PC-015), Fastify plugin registration (`as unknown as AdapterPlugin`, PC-016), LangChain dual-identity types (`as unknown as BaseRetrieverInterface` / `VectorStoreInterface` / `Embeddings`, PC-005, PC-012).

## External integrations

- **Ports.** `MESSAGING` (Twilio WhatsApp: `sendWhatsapp`, `parseInboundWhatsapp`), `EMBEDDINGS` (LangChain `Embeddings`, Voyage), `VECTOR_STORE` (`upsertChunks` / `loadIndex` / `deleteBySourceId` over Supabase pgvector), `RERANKER` (Voyage `rerank-2.5` via `ResilientClient`), `CHAT_MODEL` (`ChatAnthropic` factory — the only `new ChatAnthropic` in the repo), `SITE_CRAWLER` (Spider), `FILE_STORAGE` (GCS), `TEXT_TO_SPEECH` (Google, or ElevenLabs via `TTS_PROVIDER`), `OCR` (Google Vision), `CUSTOMER_DATABASE` (per-request TypeORM `DataSource` to an agent's external database). Inject by token, type by interface; every interface extends `IntegrationGateway` (`name`, `state()`).
- **External field names stay in `<source>.contracts.ts` / `<source>.mappers.ts`.** A payload outside the contract is rejected (`BadRequestException` on webhooks, `BadGatewayException` on responses), never defaulted. `grep -rE "axios|fetch\(" src/modules` stays empty.
- **Missing credentials never break the boot.** A live gateway without its key reports `NOT_CONFIGURED` and throws `ServiceUnavailableException` only when called. Google clients rely on ADC and are built lazily (`READY`).
- **`ResilientClient`**: `AbortController` timeout, retry with backoff + jitter on `GET`/`HEAD`/`OPTIONS` and 408/425/429/5xx only, circuit breaker per dependency, `redirect: 'error'`, `x-request-id` propagation, SSRF guard (allowlist `HTTP_ALLOWED_HOSTS`, default `api.voyageai.com`). A new host goes into the allowlist.
- **`CUSTOMER_DATABASE`** validates the host against `CUSTOMER_DATABASE_ALLOWED_HOSTS` (internal networks only with `CUSTOMER_DATABASE_ALLOW_INTERNAL_NETWORK=true`), applies `CUSTOMER_DATABASE_*_TIMEOUT_MS`; the SQL guard (`detectDialect`, `sanitizeSqlQuery`) is the pure module `integration/customer-database/sql-guard.ts`.
- **Env:** `INTEGRATION_MODE`, `HTTP_*`, `ANTHROPIC_BASE_URL` (defaults to the DeepSeek Anthropic-compatible endpoint; set it explicitly to reach Anthropic), `TTS_PROVIDER`, `GCS_AUDIO_BUCKET`.

## AI pipeline essentials

- **Flow:** `POST /support/question` (NDJSON) or `POST /chat/attendant` → `CreateSessionIfNotExists` → `ResolveAgent` (`CHAT_MODEL`, tools, `PostgresSaver` checkpointer when `with_history`) → `GenerateAiResponse` (`createAgent`, `responseFormat: AgentFinalResponseSchema`, `handleStreamResponse`) → `RecordChatMessage` (embeds via `EMBEDDINGS`). `thread_id` is `conversationId ?? session.id`; changing the format detaches every stored thread (the old organization prefix was stripped by migration `RemoveMultiTenancy1759700000000`).
- **Retrieval is threshold-based, not top-K.** `vector_similarity_search` fetches `VECTOR_SEARCH_CANDIDATE_K` (50) candidates and `VoyageRerankCompressor` keeps those scoring `>= VECTOR_SEARCH_MIN_SCORE` (0.8), capped at `VECTOR_SEARCH_MAX_RESULTS` (10). Empty results are by design; the `warn` with the best score is the tuning signal. Never move the cutoff onto the cosine score.
- **A search costs two Voyage calls** (embed + rerank) on the same `VOYAGEAI_API_KEY`; without a default payment method the quota is 3 RPM / 10K TPM (PC-007).
- **Ingestion** (`sources/process-*-source`, `load-agent-sites`) must tag every chunk with `agent_id` + `source_id` before `VECTOR_STORE.upsertChunks`; the `documents` table, `match_documents` and the pgvector index live only in Supabase and are applied by hand in its SQL editor.
- **Attendant agents** store instructions under the `AIInstructions` keys (`context`, `objetivo`, `diretrizes`); `ResolveAgent` answers 404 for an agent without instructions.

## Agent database connection (`execute_sql`)

Opt-in per agent: `agents.database_tool = true` **and** `agents.database_url` (`postgres://`, `postgresql://`, `mysql://` or `mysql2://`) set through `databaseUrl` on `POST /agent/create` / `PATCH /agent/:id`. Optional `databaseTables` (allow-list passed to the schema description) and `databaseSampleRows`. `database_url` is `select: false`, read only by `AgentRepository.findDatabaseConnection`, and never returned by the API. `LoadDatabaseTool` keeps the guardrails: single statement, first-verb allow-list (`SELECT`/`INSERT`/`UPDATE`), deny regex `DELETE|ALTER|DROP|CREATE|REPLACE|TRUNCATE`, forced `LIMIT 5`.

## Tests

- **Two layers.** Unit specs (`src/**/*.spec.ts`) only for pure functions and self-contained modules (mappers, `sql-guard`, http-client, permissions, `TokenVerifier`, `VoyageRerankCompressor`, utils) plus the Nest-module specs `auth-layer.spec.ts` and `http-layer.spec.ts`. A service spec that mocks a repository is **not** added; the behavior goes to `test/<domain>.e2e-spec.ts`.
- **One e2e file per domain** (`test/*.e2e-spec.ts`, serial): happy path, 400 with `details`, 401, 403 (missing permission) and 404 per use case. `createTestApp()` boots the real `AppModule` on Fastify with `INTEGRATION_MODE=mock`; fixtures from `test/support/factories.ts`; `t.reset()` truncates every table in `beforeEach`.
- **Database.** `test/global-setup.ts` uses `TEST_DATABASE_URL` (CI: `postgres:16-alpine` service container; local: `docker compose up postgres`) or a Testcontainers Postgres, then `scripts/test/prepare-database.ts` synchronizes the schema from the entities and marks the migrations applied (PC-017). Migrations are therefore not exercised by e2e; test a new migration by hand against a database built from the previous entities.

## Things that bite

- **Schema changes go through migrations; `synchronize` is off.** Entity → `bun run db:generate …` against a mirror of production → review (`CREATE INDEX CONCURRENTLY` + `transaction = false` on big tables) → commit entity and migration together. `db:check` fails when they diverge (PC-011).
- **`ContextualCompressionRetriever` comes from `@langchain/classic`** (PC-005); `@langchain/langgraph` must stay aligned with the version `langchain@1.x` expects (`MemorySaver` must be a `BaseCheckpointSaver`).
- **TypeORM scripts run under ts-node/CommonJS**, never under bun's ESM loader (PC-006): `db:*`, `test:db:prepare`, `repair:thread`.
- **`.env` is git-ignored; `.env.example` is the template.** Missing `DATABASE_URL` or `JWT_SECRET` aborts the boot listing every problem.

## Commit & CI

- Conventional Commits enforced by commitlint (`build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test`). Subject in lowercase, no trailing period, blank line before body.
- Husky `pre-commit` runs `lint-staged` → ESLint + Prettier on staged files.
- **Production API runs on Railway**: its environment variables (including `ALLOWED_ORIGINS`) are set in the Railway dashboard, not in this repo. The Cloud Run deploy job below still exists in CI.
- `.github/workflows/ci-cd.yml`: PRs run `format:check`, `lint`, `typecheck`, `test`, `test:e2e` (Postgres service container) and `build`. Pushes to `main` run the `migrate` job (`db:migrate`, concurrency 1) and then build the Docker image and `gcloud run deploy split-ai` in `southamerica-east1` (`min-instances 1, max-instances 2, 4Gi, 4 CPU`). Cloud Run binds `$PORT`, which is why `env.PORT` has no hard-coded production value.
