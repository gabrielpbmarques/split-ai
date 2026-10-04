# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About this project

`split-ai` is a **third project** living inside `bravohub-analytics-workspace/`, alongside `bravohub-api` and `bravohub-analytic-frontend`. The workspace `CLAUDE.md` one level up does **not** mention it — that file only describes the other two. Treat this file as authoritative when working under `split-ai/`.

It's a NestJS 10 + Fastify backend for an AI assistant product (chat, OCR, source ingestion, voice, WhatsApp, billing). The AI pipeline is built on LangChain / LangGraph with Anthropic Claude models for chat and Voyage AI for retrieval — `voyage-3-large` (1024 dims) for embeddings and `rerank-2.5` as a cross-encoder reranker; vector storage in Supabase/pgvector, and PostgreSQL (also hosted on Supabase) as the primary store via TypeORM. It is independent of the BravoHub products — no shared database, no shared auth contract. Tenant-specific data access is opt-in via the per-org `database_url` + the `database_connection` feature flag (see "Per-org database connection feature" below).

## The specification: `ai-agents-engineering/docs/backend/rules/`

The architecture of this repository **is** the rule set in the sibling repository `gabrielpbmarques/ai-agents-engineering`, folder `docs/backend/rules/` (`../ai-agents-engineering/docs/backend/rules/` when both are checked out side by side). Read the rule that owns the area before changing it; this file does not restate the rules, it records where this product **differs** from them and what is specific to it.

| Rule file | Owns | Here |
| --- | --- | --- |
| `00-visao-geral.md` | index, stack | stack deviations below (bun, TypeORM, Jest) |
| `01-topologia.md` | `src/` layout, `modules/<domain>/<use-case>`, `infrastructure/`, `shared/` | tree below; no global `/api` prefix |
| `02-convencoes-fundamentais.md` | `strict`, no comments, no `any`, absolute imports, kebab-case | identifiers in **English**, messages in Portuguese; `lint:comments` |
| `03-modulo-nest.md` | module `imports` discipline, aggregators, `@Global()` | `IntegrationModule` + `AgentRuntimeContractsModule` are the only globals besides `AuthModule` guards; `di:verify` / `di:boot-check` |
| `04-anatomia-caso-de-uso.md` | one use case = one module/controller/endpoint | the only exception is `QuestionController` (NDJSON streaming) |
| `05-controllers-services-dtos.md` | `handle()`, `execute()`, `@Res() FastifyReply`, DTOs, repositories, tests | pagination helpers and `requireOrganizationId` below |
| `06-injecao-dependencia.md` | tokens, ports, `useExisting` | `AGENT_RESOLVER` uses a lazy `ModuleRef` factory (PC-008) |
| `07-interceptors-decorators.md` | exception filter, `ErrorResponse`, logging, health | `GlobalExceptionFilter`, pino, `/health/{startup,live,ready}` |
| `08-autenticacao-autorizacao.md` | guards, permissions, `AccessScopeService` | this app **issues** its own JWT (PC-001) and accepts a BravoHub token (PC-002); decorator names below |
| `09-banco-de-dados.md` | schema, soft delete, `tx?`, migrations | TypeORM instead of Drizzle; no baseline migration (PC-017) |
| `10-integracoes-externas.md` | gateway → Zod contract → mapper → domain, `ResilientClient`, mock mode | twelve ports, `INTEGRATION_MODE` default |
| `11-fluxo-de-raciocinio-nova-funcionalidade.md` | **how to implement a new feature**: 18 questions, plan before code, implementation order | mandatory for every feature; the PR template carries its closing checklist |
| `12-problemas-conhecidos.md` | the `PC-NNN` register protocol | this repo's register is `docs/problemas-conhecidos.md` (PC-001…PC-018) |

**Name mapping.** The rules use Portuguese identifiers; this code base keeps English ones (decision in `docs/plano-refatoracao-backend-rules.md` §2). Translate when reading a rule:

| Rule | Here |
| --- | --- |
| `@Publico()` / `@ExigirPermissoes('x.y')` / `@Usuario()` | `@Public()` / `@RequirePermissions('x.y')` / `@User()` (aliased `AuthUser` in controllers) |
| `AccessScopeService.garantirPode` | `AccessScopeService.ensureCan(user, permission, { organizationId }, message)` |
| `RepositorioPedidos` / `ModuloRepositorioPedidos` | `OrderRepository` / `OrderRepositoryModule` (`src/modules/<domain>/repositories/`) |
| `executor-transacao.executar(trabalho)` | `TransactionExecutor.run(async (tx) => …)` |
| `colunasCicloDeVida` | `created_at` / `updated_at` / `deleted_at` columns declared on each entity |
| `MockConnector` / `HttpConnector` / `source-registry` | `integration/mock/*` fakes and per-source gateways; no record-collection connectors exist (every integration is an imperative call) |
| `@AcaoAuditoria`, `EVENT_PUBLISHER`, `audit_logs` | not implemented; no event bus or audit trail in this product yet |

**New feature = rule `11` first.** Answer its 18 questions, write the plan in its Part 2 format, show it to the requester, then implement in the Part 3 order (schema → models → modules → use cases → tests → verification). `.github/pull_request_template.md` is its Part 4 checklist adapted to this repo.

## Conscious deviations from the rules

| Topic | Rule | Decision here | Why |
| --- | --- | --- | --- |
| ORM | Drizzle + `pg` | **TypeORM 0.3** with `EntityManager` as `tx`, `migration:generate` for migrations | 22 entities and `PostgresSaver` already on `pg`; a rewrite was ruled out by the requester |
| Package manager | pnpm | **bun** (`bun.lock`, Dockerfile, CI) | |
| Tests | Vitest + Testcontainers | **Jest** (`ts-jest`); e2e against a Postgres from `TEST_DATABASE_URL` (CI service container), Testcontainers only as local fallback | |
| Identity | Resource Server, external IdP | this app **issues** HS256 JWTs (`/auth/login`, SMS, invites) — PC-001 | product requirement |
| Identifiers | domain language (Portuguese) | **English** folders/classes/columns, Portuguese user-facing messages and Swagger | 400+ files and external consumers (widget, BravoHub) |
| Global prefix | `app.setGlobalPrefix(env.API_PREFIX)` | **none**; routes mount at each `@Controller()` path | widget, Cloud Run health and BravoHub depend on current paths |
| Permissions | `papeis`/`permissoes` tables | **derived**: `src/auth/permissions.ts` grants over `(role, org_role)` | no product need for per-user grants yet |
| `INTEGRATION_MODE` default | `mock` | `mock` only when `NODE_ENV=test`, `live` otherwise | existing dev `.env` files carry real keys |
| `ResilientClient` everywhere | every external call | only hand-written HTTP (Voyage rerank); SDKs keep their stack — PC-013 | |
| `isolatedModules` | on | **off** — PC-014 | conflicts with `consistent-type-imports` under `emitDecoratorMetadata` |
| `noUncheckedIndexedAccess` | on | **off** for now (82 legitimate indexings) | listed as follow-up in the plan |
| Baseline migration | required | none; the three migrations are deltas over the production schema — PC-017 | production schema predates migrations |
| Rate limiting | `ThrottlerGuard` per route is the only `@UseGuards` | kept on the SMS routes only | |

## Package manager

**Use `bun`.** The lockfile is `bun.lock`, the Dockerfile uses `bun`, and CI runs `bun install` then `format:check`, `lint`, `typecheck`, `test`, `test:e2e` and `build`. The `package.json` scripts call `nest`/`jest` directly so they work under either bun or npm, but stay on bun to keep the lockfile honest.

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
docker compose up                           # api + local Redis + Postgres (for e2e)
```

The dev server defaults to **port 4000** (`PORT` default in `src/shared/config/env.ts`).

## How guidance is organized: rules, scoped-rules, skills

- **Always-on.** This `CLAUDE.md`: the pointer to the rules, the deviations, the product-specific invariants below. Skills point here, never restate.
- **Scoped-rules** (`.claude/rules/*.md`, YAML `paths:` frontmatter, reload on matching files and survive `/compact`):
  - `src-scaffolding.md` (`src/**/*.ts`) — the invariants most often broken when adding code.
  - `aichat-streaming.md` (`src/modules/chat/**`) — NDJSON streaming invariants.
  - `ai-agent.md` (`agents/`, `agent-runtime/`, `retrieval/`, `ai-instructions.model.ts`) — agent config/runtime invariants.
  - `agent-tools.md` (`retrieval/**`, `build-zod-schema.ts`) — tool + SQL-guardrail invariants.
  - `rag-ingestion.md` (`sources/`, `load-agent-sites/`, `integration/supabase/**`) — chunks must carry `agent_id` + `source_id`.
  - `tests.md` (`test/**`, `src/**/*.spec.ts`) — the two test layers and the e2e harness.
- **Skills** (`.claude/skills/`, body loads on demand): `architecture`, `code-patterns`, `import-and-naming-conventions`, `thinking-flow`, `tech-stack` are this repo's **delta** over rules `01`–`06` (paths, names, templates); the AI pipeline is in `agent-end-to-end-flow` (start here for cross-area changes), `ai-agent-configuration`, `ai-agent-runtime`, `ai-agent-tools-and-rag`, `ai-chat-flows`; `langchain-anthropic-integration` and `eleven-labs` are vendored library references.
- **Docs** (`docs/`): `plano-refatoracao-backend-rules.md` (the migration plan, phases 0–9 with status), `problemas-conhecidos.md` (PC register), `decisoes-de-dominio.md` (domain decisions that used to live in comments), and the product runbooks `analytics-agent-team-setup.md`, `oracle-analytics-subagents-payloads.md`, `bravohub-analytics-integration.md`.

## Architecture in one screen

```
src/
  main.ts                    Fastify bootstrap (createFastifyAdapter, global pipe, pino, Swagger)
  app.module.ts              Root — AppLoggerModule, TypeOrmModule.forRoot(ENTITIES, MIGRATIONS), IntegrationModule,
                             AuthModule, HealthModule, one aggregator module per domain
  auth/                      Global guards, TokenVerifier, PrincipalResolverService, AccessScopeService, permissions,
                             request-user.ts (requireUserId / requireOrganizationId)
  infrastructure/
    database/schema/         TypeORM entities + barrel exporting ENTITIES (the only place tables are declared)
    database/migrations/     MIGRATIONS (run by the CI `migrate` job, never at boot); data-source.ts for the CLI
    database/transaction-executor/   TransactionExecutor.run(async (tx) => …)
    integration/             The ONLY place that talks to an external service (rule 10):
      integration.module.ts  @Global() — publishes every port below (mock or live per INTEGRATION_MODE)
      <name>.port.ts         Symbol token + interface: PAYMENTS, MESSAGING, EMAIL, EMBEDDINGS, VECTOR_STORE,
                             RERANKER, CHAT_MODEL, SITE_CRAWLER, FILE_STORAGE, TEXT_TO_SPEECH, OCR, CUSTOMER_DATABASE
      http-client/           ResilientClient (timeout, retry+backoff, circuit breaker, SSRF guard, correlation)
      <source>/              stripe, twilio, sendgrid, supabase, voyage, anthropic, spider, google, eleven-labs,
                             customer-database: <source>.contracts.ts (Zod of the external payload),
                             <source>.mappers.ts (+ spec), <source>-<port>.gateway.ts (the adapter)
      mock/                  In-memory implementation of every port (INTEGRATION_MODE=mock, default in tests)
      integration.health.ts  Per-upstream state (READY | NOT_CONFIGURED | MOCK) reported by /health/ready
  modules/<domain>/          agents, agent-runtime, retrieval, voice, chat, sessions, sources, agent-connections,
                             organizations, members, users, auth-flows, api-keys, billing, reports, notifications, whatsapp
    <domain>.module.ts       Aggregator: imports + exports the use-case modules, nothing else
    <use-case>/              One use case = one module = one controller = one endpoint (kebab-case files)
    repositories/            <name>.repository.ts + <name>.repository.module.ts (forFeature + provides/exports)
    contracts/               Ports (Symbol token + interface) published to other domains, when needed
  shared/
    config/env.ts            Zod-validated, frozen `env` object — the ONLY place that reads process.env
    contracts/               Shared TS types + barrel, ErrorResponse, pagination (PageRequest/PageResult/toPaginatedResponse)
    decorators/              @Public, @RequirePermissions, @RequireActiveOrganization, @User
    http/                    Fastify adapter factory, validation pipe, exception filter, error mapper, pagination.dto, health/
    observability/           correlation (AsyncLocalStorage), pino logger module, Sentry init
    utils/                   Pure helper functions, kebab-case
scripts/refactor-di/         di:verify / di:boot-check      scripts/lint/no-comments.ts     scripts/test/prepare-database.ts
test/                        e2e per domain + support/ (test-app, factories, database) + global-setup
```

## Product-specific invariants (what the rules do not say)

- **`AuthenticatedUser.id` and `organization_id` are `string | null`** (service principals, guests, platform admins without org). A handler that needs them calls `requireUserId(user)` / `requireOrganizationId(user)` (`src/auth/request-user.ts`, 403 when absent). Never `!`.
- **Permissions catalog** (`src/auth/permissions.ts`): platform `admin`/`user` are staff (`agent.*`, `source.*`, `session.read`, `report.read`, `analytics.read`, `voice.synthesize`, `organization.read`); only `admin` has `agent.manage`, `organization.manage`, `user.manage`; `guest` has `account.access` + chat; `service` (API key, embed token, BravoHub) has only `chat.ask`; `member.manage` / `api-key.manage` follow `org_role` (`owner`/`admin`). `@RequireActiveOrganization()` guards chat and conversation routes; `ResolveAgentService` also refuses agents of inactive organizations.
- **`TokenVerifier`** (`src/auth/token.verifier.ts`) is the only class that knows token formats: native HS256 JWT (`env.JWT_SECRET`, issued by `GenerateTokenService`), the BravoHub HS512 token (`env.BRAVOHUB_JWT_SECRET`), and `Authorization: ApiKey <token>` resolved against `api_keys` (`findValidByHash(sha256)`) with fallback to `organizations.chat_embed_token`.
- **Whitelabel model.** `users.org_role` (`owner` > `admin` > `member`) travels in the JWT. `PlanEntity` carries `max_agents` / `max_users` (`null` = unbounded), `unlimited` (bypasses credit billing **and** quotas — MAIA playground) and `monthly_credits` (granted on org creation). Seed MAIA + base plans with `bun run seed:maia` (ts-node/CommonJS, PC-006).
- **Pagination**: list query DTOs extend `PaginationDto`; repositories return `PageResult`; services return `toPaginatedResponse()` → `{ items, total, totalPages, page, limit }`. Listing methods take `fields?: readonly K[]` before `tx?` and return `Pick<Entity, K>[]`.
- **Transactions** live in services (`TransactionExecutor.run`), `tx` is the last argument of every repository write; used by `CreateOrganization`, `StripeWebhook`, `CreateAgent`, `UpdateAgent`. External effects run after the commit.
- **Soft delete everywhere** except the trails `token_usage` and `credit_transactions`; unique indexes are partial (`WHERE "deleted_at" IS NULL`); raw `from('table')` subqueries must filter `deleted_at` themselves.
- **No global API prefix.** Health at `/health/startup` (503 while migrations are pending), `/health/live`, `/health/ready` (database + memory + per-integration state). Swagger at `/docs` only with `SWAGGER_ENABLED=true` outside production.
- **Bootstrap order is fixed** (`src/main.ts`): `dotenv/config` → `createFastifyAdapter()` (helmet without CSP/frameguard for the embed widget, multipart, `x-request-id` correlation) → pino (`AppLoggerModule`, redacts auth headers) → CORS from `ALLOWED_ORIGINS` (empty = reflect any origin; `*` rejected) → global pipe → shutdown hooks → Swagger → listen. `DevtoolsModule` is skipped under `NODE_ENV=test` (PC-018).
- **`env.ts` is the only reader of `process.env`**; new variable → Zod schema **and** `.env.example`. Never paste secret values into messages or commits.
- **Lint beyond the rules**: `import/order` (builtin → external → `src/…`), `check-file` kebab-case, `no-restricted-imports` for `./` `../` (schema folder excepted), `no-console`, `no-inline-comments`, `no-warning-comments`, `consistent-type-imports` (the rule keeps value imports for decorated constructor params — never hand-write `import type` on those), `no-explicit-any` (specs excepted), and `scripts/lint/no-comments.ts` as the last step of `bun run lint`. Knowledge that used to live in comments is in `docs/decisoes-de-dominio.md`.
- **Three deliberate casts**: TypeORM `update()` payloads (`as QueryDeepPartialEntity<Entity>`, PC-015), Fastify plugin registration (`as unknown as AdapterPlugin`, PC-016), LangChain dual-identity types (`as unknown as BaseRetrieverInterface` / `VectorStoreInterface` / `Embeddings`, PC-005, PC-012).

## External integrations (rule `10`)

- **Ports.** `PAYMENTS` (Stripe: `createCheckout`, `parseWebhookEvent` → internal `PaymentEvent` union), `MESSAGING` (Twilio SMS/WhatsApp + `parseInboundWhatsapp`), `EMAIL` (SendGrid), `EMBEDDINGS` (LangChain `Embeddings`, Voyage), `VECTOR_STORE` (`upsertChunks` / `loadIndex` / `deleteBySourceId` over Supabase pgvector, returns LangChain `VectorStoreInterface`), `RERANKER` (Voyage `rerank-2.5` via `ResilientClient`), `CHAT_MODEL` (`ChatAnthropic` factory — the only `new ChatAnthropic` in the repo), `SITE_CRAWLER` (Spider), `FILE_STORAGE` (GCS), `TEXT_TO_SPEECH` (Google, or ElevenLabs via `TTS_PROVIDER`), `OCR` (Google Vision), `CUSTOMER_DATABASE` (per-request TypeORM `DataSource` to the tenant's DB). Inject by token, type by interface; every interface extends `IntegrationGateway` (`name`, `state()`); the module imports nothing for it.
- **External field names stay in `<source>.contracts.ts` / `<source>.mappers.ts`.** A payload outside the contract is rejected (`BadRequestException` on webhooks, `BadGatewayException` on responses), never defaulted. `grep -rE "axios|fetch\(" src/modules` must stay empty (the only hit is browser-side JS inside the embed page template).
- **Missing credentials never break the boot.** A live gateway without its key reports `NOT_CONFIGURED` and throws `ServiceUnavailableException` only when called. Google clients rely on ADC and are built lazily (`READY`).
- **`ResilientClient`**: `AbortController` timeout, retry with backoff + jitter on `GET`/`HEAD`/`OPTIONS` and 408/425/429/5xx only, circuit breaker per dependency, `redirect: 'error'`, `x-request-id` propagation, SSRF guard (http/https only; loopback/private/link-local/metadata blocked; allowlist `HTTP_ALLOWED_HOSTS`, default `api.voyageai.com`). A new host goes into the allowlist.
- **`CUSTOMER_DATABASE`** validates the host against `CUSTOMER_DATABASE_ALLOWED_HOSTS` (internal networks only with `CUSTOMER_DATABASE_ALLOW_INTERNAL_NETWORK=true`), applies `CUSTOMER_DATABASE_*_TIMEOUT_MS`, and the SQL guard (`detectDialect`, `sanitizeSqlQuery`, `assertScoped`) is the pure module `integration/customer-database/sql-guard.ts`.
- **Env:** `INTEGRATION_MODE`, `HTTP_TIMEOUT_MS`, `HTTP_RETRIES`, `HTTP_BACKOFF_BASE_MS`, `HTTP_CIRCUIT_FAILURE_THRESHOLD`, `HTTP_CIRCUIT_OPEN_MS`, `HTTP_ALLOWED_HOSTS`, `ANTHROPIC_BASE_URL` (defaults to the DeepSeek Anthropic-compatible endpoint the code used to hard-code; set it explicitly to reach Anthropic), `TTS_PROVIDER`, `GCS_AUDIO_BUCKET`.

## AI pipeline essentials

- **Flow:** `POST /support/question` (NDJSON) or `POST /chat/attendant` → `CreateSessionIfNotExists` → `ResolveAgent` (`CHAT_MODEL`, tools, `PostgresSaver` checkpointer when `with_history`) → `GenerateAiResponse` (`createAgent`, `responseFormat: AgentFinalResponseSchema`, `handleStreamResponse`) → `RecordChatMessage` (embeds via `EMBEDDINGS`). `thread_id` is `conversationId ?? session.id`, prefixed by the organization; changing the format detaches every stored thread.
- **Retrieval is threshold-based, not top-K.** `vector_similarity_search` fetches `VECTOR_SEARCH_CANDIDATE_K` (50) candidates for recall and `VoyageRerankCompressor` keeps those scoring `>= VECTOR_SEARCH_MIN_SCORE` (0.8), capped at `VECTOR_SEARCH_MAX_RESULTS` (10). Empty results are by design; the `warn` with the best score is the tuning signal. Never move the cutoff onto the cosine score.
- **A search costs two Voyage calls** (embed + rerank) on the same `VOYAGEAI_API_KEY`; without a default payment method the quota is 3 RPM / 10K TPM (PC-007).
- **Ingestion** (`sources/process-*-source`, `load-agent-sites`) must tag every chunk with `agent_id` + `source_id` before `VECTOR_STORE.upsertChunks`; the `documents` table, `match_documents` and the pgvector index live only in Supabase and are applied by hand in its SQL editor.
- **Attendant agents** store instructions under the `AIInstructions` keys (`context`, `objetivo`, `diretrizes`); `ResolveAgent` answers 404 for an agent without instructions.

## Per-org database connection feature

Single, opt-in mechanism for an agent to query its organization's own database.

- **Pré-requisitos** (gate em `MaybeLoadDatabaseToolService`): agente com `database_tool = true` e `organization_id`; `organizations.database_url` (`postgres://` ou `mysql://`); linha em `organization_features` ligando a org à feature `database_connection` com `enabled = true` (tabelas `features` / `organization_features` e a coluna `database_url` foram criadas por SQL manual no Supabase). Qualquer pré-requisito faltando → a tool não aparece para o LLM.
- **`LoadDatabaseTool`** monta `execute_sql` sobre a porta `CUSTOMER_DATABASE`: statement única; allow-list do primeiro verbo (`SELECT`/`INSERT`/`UPDATE`; read-only só `SELECT`); deny regex `DELETE|ALTER|DROP|CREATE|REPLACE|TRUNCATE`; `LIMIT 5` forçado. Agentes em `env.BRAVOHUB_SCOPED_AGENTS` rodam company-scoped read-only (`assertScoped` em `company_id`), e `BuildSystemPromptService` injeta a diretriz de isolamento por código.
- **Auth S2S** é per-org: `Authorization: ApiKey <api_keys secret>` ou o `chat_embed_token` da organização; `role: 'service'` fica fora da cobrança de créditos.
- **Env:** `ANTHROPIC_API_KEY`, `VOYAGEAI_API_KEY`, `EMBEDDING_MODEL` (`voyage-3-large`), `ORCHESTRATOR_MODEL` (default `claude-sonnet-4-6`), `RERANK_MODEL`, `VECTOR_SEARCH_*`.

## Tests

- **Two layers.** Unit specs (`src/**/*.spec.ts`) only for pure functions and self-contained modules (mappers, `sql-guard`, http-client, permissions, `AccessScopeService`, `TokenVerifier`, `VoyageRerankCompressor`, utils) plus the two Nest-module specs `auth-layer.spec.ts` and `http-layer.spec.ts`. A service spec that mocks a repository is **not** added; the behaviour goes to `test/<domain>.e2e-spec.ts`.
- **One e2e file per domain** (`test/*.e2e-spec.ts`, serial): happy path, 400 with `details`, 401, 403 (permission and organization scope), 404 per use case. `createTestApp()` boots the real `AppModule` on Fastify with `INTEGRATION_MODE=mock`; fixtures from `test/support/factories.ts`; `t.reset()` truncates every table in `beforeEach`.
- **Database.** `test/global-setup.ts` uses `TEST_DATABASE_URL` (CI: `postgres:16-alpine` service container; local: `docker compose up postgres`) or a Testcontainers Postgres, then `scripts/test/prepare-database.ts` synchronizes the schema from the entities and marks the migrations applied (PC-017).

## Things that bite

- **Schema changes go through migrations; `synchronize` is off.** Entity → `bun run db:generate …` against a mirror of production → review (`CREATE INDEX CONCURRENTLY` + `transaction = false` on big tables) → commit entity and migration together. `db:check` fails when they diverge (PC-011).
- **`ContextualCompressionRetriever` comes from `@langchain/classic`** (PC-005); `@langchain/langgraph` must stay aligned with the version `langchain@1.x` expects (`MemorySaver` must be a `BaseCheckpointSaver`).
- **TypeORM scripts run under ts-node/CommonJS**, never under bun's ESM loader (PC-006): `db:*`, `seed:maia`, `test:db:prepare`.
- **`.env` is git-ignored; `.env.example` is the template.** Missing `DATABASE_URL` or `JWT_SECRET` aborts the boot listing every problem.
- **`bravohub-analytics-workspace/CLAUDE.md` doesn't apply here.** Its scope rule fires only when `pwd` ends in `bravohub-analytics-workspace`.

## Commit & CI

- Conventional Commits enforced by commitlint (`build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test`). Subject in lowercase, no trailing period, blank line before body.
- Husky `pre-commit` runs `lint-staged` → ESLint + Prettier on staged files.
- `.github/workflows/ci-cd.yml`: PRs run `format:check`, `lint`, `typecheck`, `test`, `test:e2e` (Postgres service container) and `build`. Pushes to `main` run the `migrate` job (`db:migrate`, concurrency 1) and then build the Docker image and `gcloud run deploy split-ai` in `southamerica-east1` (`min-instances 1, max-instances 2, 4Gi, 4 CPU`). Cloud Run binds `$PORT`, which is why `env.PORT` has no hard-coded production value.
