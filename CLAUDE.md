# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About this project

`split-ai` is a **third project** living inside `bravohub-analytics-workspace/`, alongside `bravohub-api` and `bravohub-analytic-frontend`. The workspace `CLAUDE.md` one level up does **not** mention it — that file only describes the other two. Treat this file as authoritative when working under `split-ai/`.

It's a NestJS 10 + Fastify backend for an AI assistant product (chat, OCR, source ingestion, voice, WhatsApp, billing). The AI pipeline is built on LangChain / LangGraph with Anthropic Claude models for chat and Voyage AI for retrieval — `voyage-3-large` (1024 dims) for embeddings and `rerank-2.5` as a cross-encoder reranker; vector storage in Supabase/pgvector, and PostgreSQL (also hosted on Supabase) as the primary store via TypeORM. It is independent of the BravoHub products — no shared database, no shared auth contract. Tenant-specific data access is opt-in via the per-org `database_url` + the `database_connection` feature flag (see "Per-org database connection feature" below).

## Package manager

**Use `bun`.** The lockfile is `bun.lock`, the Dockerfile uses `bun`, and CI runs `bun install` then `format:check`, `lint`, `typecheck`, `test` and `build`. The README's `bun install` line is correct; the `package.json` scripts call `nest`/`jest` directly so they work under either bun or npm, but stay on bun to keep the lockfile honest.

## Commands

```bash
bun install                                 # install deps
bun run start:dev                           # watch mode (default port 4000)
bun run start:prod                          # run compiled dist/main
bun run build                               # nest build → dist/
bun run lint                                # eslint (check only; CI runs this)
bun run lint:fix                            # eslint --fix
bun run typecheck                           # tsc --noEmit
bun run format:check                        # prettier --check
bun run test                                # jest (unit + pure-function specs under src/)
TEST_DATABASE_URL=postgres://postgres@127.0.0.1:5432/split_ai_test bun run test:e2e   # e2e (needs a Postgres; see Tests)
bun run test:cov                            # coverage
bun jest src/path/to/file.spec.ts           # single file
bun jest -t "test name fragment"            # single test by name
docker compose up                           # api + local Redis
```

The dev server defaults to **port 4000** (`PORT` default in `src/shared/config/env.ts`).

## How guidance is organized: rules, scoped-rules, skills

Project guidance lives at three loading tiers. Pick the right tier when adding new guidance:

- **Rules — always-on.** This `CLAUDE.md` (root) is the single source of truth for universal invariants: the "Hard rules", "Things that bite", "Service & reasoning conventions", and the per-org DB feature. Skills must **point to** these, not restate them.
- **Scoped-rules — auto-load by path.** Path-scoped rules in `.claude/rules/*.md` (YAML `paths:` glob frontmatter) re-load whenever you read a matching file and survive `/compact`. They stay thin: a handful of must-not-break invariants + a pointer to the deep skill, so subsystem gotchas surface without the model having to open a skill:
  - `.claude/rules/src-scaffolding.md` (`src/**/*.ts`) — scaffolding index (→ `architecture` / `code-patterns` / `import-and-naming-conventions`).
  - `.claude/rules/aichat-streaming.md` (`src/modules/chat/**/*.ts`) — chat-streaming invariants (→ `ai-chat-flows`).
  - `.claude/rules/ai-agent.md` (`src/modules/agents/ + src/modules/agent-runtime/ + src/modules/retrieval/**/*.ts` + `ai-instructions.model.ts`) — agent config/runtime invariants (→ `ai-agent-configuration` / `ai-agent-runtime`).
  - `.claude/rules/agent-tools.md` (`src/modules/retrieval/**/*.ts` + `buildZodSchema.ts`) — tool + SQL-guardrail invariants (→ `ai-agent-tools-and-rag`).
  - `.claude/rules/rag-ingestion.md` (`src/modules/sources/`, `load-agent-sites/`, `supabase-vector-store.gateway.ts`) — ingestion metadata contract: chunks must carry `agent_id` + `source_id` (→ `ai-agent-tools-and-rag`).
- **Skills — on-demand.** `.claude/skills/` holds twelve SKILL.md files. Only the one-line `description` is in context each turn (it competes for a small budget — keep descriptions short and trigger-led); the body loads when invoked. Use skills for depth and worked examples.

**General code skills** (the conventions also live as Hard rules above):

- `architecture` — module hierarchy, scope/use-case pattern, repository/provider patterns
- `code-patterns` — controller/service/DTO templates, error handling, parallel async
- `import-and-naming-conventions` — paths, suffixes, casing, commit format
- `thinking-flow` — worked examples for the "Service & reasoning conventions" rules below
- `tech-stack` — every external integration, token, and env var

**AI pipeline** (most engineering work lives here — LangChain/LangGraph + Voyage embeddings + Supabase pgvector):

- `agent-end-to-end-flow` — the cross-cutting map: agent create + source ingestion → `/support/question` / `/chat/attendant` → `ResolveAgent` → `GenerateAIResponse` → LangGraph → tools → pgvector → persistence/billing. **Start here for any change crossing the AI areas below.**
- `ai-agent-configuration` — agent CRUD, `AIInstructions`, prompt construction, parser schemas, `agents` / `agents_instructions` tables
- `ai-agent-runtime` — `ResolveAgent`, `GenerateAIResponse`, LangGraph streaming, structured responses, `thread_id` memory via `PostgresSaver`, LangSmith tracing
- `ai-agent-tools-and-rag` — LangChain tools (`vector_similarity_search`, `execute_sql` with guardrails, parser), pgvector behavior, Spider ingestion, Voyage `voyage-3-large` embeddings, and the `rerank-2.5` cross-encoder + relevance threshold that replaced top-K retrieval
- `ai-chat-flows` — `src/modules/chat/`, the `/support/question` NDJSON streaming endpoint, `/chat/attendant`, Fastify response hijacking, session/credit/message persistence

**Model & integration reference (knowledge bases — not always wired):**

- `langchain-anthropic-integration` — `ChatAnthropic` config reference from `@langchain/anthropic` (instantiation, prompt caching, citations, context management). The `ChatVertexAI` migration is already done — read this before changing the LLM provider config. (For Claude model IDs/pricing, use the `claude-api` skill; for other library docs, prefer context7.)
- `eleven-labs` — ElevenLabs API reference (TTS, voice cloning, STT, sound effects, voice changer, conversational AI). Knowledge base for building **ElevenLabs-specific** voice features. In code, ElevenLabs is the **second implementation of the `TEXT_TO_SPEECH` port** (`src/infrastructure/integration/eleven-labs/eleven-labs-text-to-speech.gateway.ts`, only `synthesize(text)` → MP3 `Uint8Array`), selected by `TTS_PROVIDER=elevenlabs`; the default is Google TTS (`google/google-text-to-speech.gateway.ts`). Streaming and STT wrappers were removed with the port (no consumer); re-add them on the port when an endpoint needs them. Config lives in `src/shared/config/env.ts` (`ELEVENLABS_*`).

**Read the relevant skill before scaffolding new code.** This file intentionally doesn't restate skill bodies.

## Architecture in one screen

```
src/
  main.ts                    Fastify bootstrap (createFastifyAdapter, global pipe, pino, Swagger)
  app.module.ts              Root — AppLoggerModule, TypeOrmModule.forRoot(ENTITIES), AuthModule, HealthModule,
                             one aggregator module per domain (AgentsModule, ChatModule, BillingModule, …)
  auth/                      Global guards, TokenVerifier, PrincipalResolverService, AccessScopeService, permissions
  infrastructure/
    database/schema/         TypeORM entities + barrel exporting ENTITIES (the only place tables are declared)
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
  modules/<domain>/          Business domains, kebab-case: agents, agent-runtime, retrieval, voice, chat, sessions,
                             sources, agent-connections, organizations, members, users, auth-flows, api-keys,
                             billing, reports, notifications, whatsapp
    <domain>.module.ts       Aggregator: imports + exports the use-case modules, nothing else
    <use-case>/              One use case = one module = one controller = one endpoint (kebab-case files)
    repositories/            <name>.repository.ts + <name>.repository.module.ts (forFeature + provides/exports)
    contracts/               Ports (Symbol token + interface) published to other domains, when needed
  shared/
    config/env.ts            Zod-validated, frozen `env` object — the ONLY place that reads process.env
    contracts/               Shared TS types + barrel (`import { User } from 'src/shared/contracts'`), ErrorResponse
    decorators/              @Public, @RequirePermissions, @RequireActiveOrganization, @User
    http/                    Fastify adapter factory, validation pipe, exception filter, error mapper, health/
    observability/           correlation (AsyncLocalStorage), pino logger module, Sentry init
    utils/                   Pure helper functions, kebab-case
  types/fastify.d.ts         request.user augmentation
scripts/refactor-di/         di:verify / di:boot-check (understand modules/<domain>/<use-case> and @Global())
```

**Hard rules** (also in skills, repeated here because they are the most common review feedback):

1. A module's `imports` array lists **exactly** the modules that supply what its own providers/controllers/guards inject — nothing more. One repository → `XRepositoryModule` (`src/modules/users/repositories/<name>.repository.module.ts`); one sibling service → that use case's own module; `TransactionExecutor` → `TransactionExecutorModule`; `AccessScopeService` → `AuthModule`. **External integrations are different**: their ports (`PAYMENTS`, `VECTOR_STORE`, `EMAIL`, … in `src/infrastructure/integration/<name>.port.ts`) are published by the `@Global()` `IntegrationModule`, so a service just does `@Inject(VECTOR_STORE) private readonly vectorStore: VectorStoreGateway` and the module imports **nothing** for it. **Never** import a domain aggregator (`AgentsModule`, `SessionsModule`, …) to reach one service inside it, and never import a module "just in case". **No `forwardRef`**: a dependency that would close a cycle goes through a port in `modules/<domain>/contracts/` (see `AGENT_RESOLVER`).
2. One use case = one module = one controller = one endpoint. Controller handler is **`handle`** (the only public method); service public method is **`execute`** (the only public method, with an explicit return type). Status: 201 create, 200 read/update with body, 204 no body. Every controller carries `@ApiTags('<domain>')` and each handler its response decorators.
3. Controllers always use `@Res() res: FastifyReply` and return `res.status(<code>).send(result)`. **No try/catch**: exceptions propagate to `GlobalExceptionFilter` (`src/shared/http/exception.filter.ts`), which answers every error as an `ErrorResponse` (`src/shared/contracts/error-response.ts`). The single exception is `QuestionController`, which hijacks the reply for NDJSON streaming and must write its own error event.
4. DTOs validated via `class-validator` by the **global** `ValidationPipe` from `createValidationPipe()` (`src/shared/http/validation-pipe.ts`): `transform`, `whitelist`, `forbidNonWhitelisted`, `forbidUnknownValues`, no implicit conversion. Every DTO field needs a decorator or it is stripped; numeric query fields need `@Type(() => Number)`. A handler that must accept an open payload (Twilio webhook, multipart upload) types its body as `Record<string, unknown>` or reads `req.body`, which skips validation.
5. User-facing error messages are in Portuguese; identifiers stay English.
6. Every new entity must be barrel-exported from `src/infrastructure/database/schema/index.ts` **and added to its `ENTITIES` array** (TypeORM no longer globs the filesystem), and its repository needs a sibling `<name>.repository.module.ts` under `src/modules/<domain>/repositories/` doing `TypeOrmModule.forFeature([XEntity])` + `providers`/`exports: [XRepository]`. `forFeature` is module-local: importing a module that registered an entity does **not** give you its `Repository<T>`.
7. Inject every constructor dependency as `private readonly` — all services/controllers use constructor DI.
8. Domain aggregators (`modules/<domain>/<domain>.module.ts`) are **wiring only**: `imports` and `exports` with the same list of use-case modules, no `providers`, no `controllers`. `AppModule` imports only aggregators. To consume a service, import the use-case module that exports it.
9. **Imports are absolute from `src/`** (`import { X } from 'src/modules/...'`), including between neighbours — `./` and `../` are lint errors (only `infrastructure/database/schema/` may import relatively). File and folder names are kebab-case (lint error otherwise).

Run `bun run scripts/refactor-di/verify.ts` after touching module wiring — it walks every module and reports any injection its `imports` no longer reach, plus controllers unreachable from `AppModule`.

## Service & reasoning conventions

How to think about a service before writing it (worked before/after examples in the `thinking-flow` skill):

1. **Push work to the database/repository.** Repositories expose **named methods only** (no `find(options)` / `findOne(options)` / `count(options)` passthroughs). Listing methods take `fields?: readonly K[]` before `tx?` and return `Pick<Entity, K>[]`; the service declares its fields in an `as const` and returns the rows untouched. Paginated listings take `PageRequest` (`{ page, limit }`), run the page and the `count` together (`findAndCount` or `Promise.all`) and return `PageResult`; the service wraps it with `toPaginatedResponse()` into `{ items, total, totalPages, page, limit }` (`src/shared/contracts/pagination.ts`). Query DTOs for lists extend `PaginationDto` (`src/shared/http/pagination.dto.ts`).
2. **Type every public method's return explicitly.** Each `execute()` declares its return type; for a strict subset of an entity, define a `Pick<>` type in `src/shared/contracts/models/` and barrel-export it.
3. **Skip checks the call chain already guarantees.** The global guards guarantee `user` on every non-public route; `@Body(new ValidationPipe())` guarantees required DTO fields; a prior `NotFoundException` guarantees the entity exists. Don't re-check them.
4. **Early return; keep the happy path flat.** Validate and throw `NestJS` exceptions at the top, then proceed. Don't catch in services or controllers — let exceptions bubble to `GlobalExceptionFilter`.
5. **Parallelize independent async work.** `Promise.all` when all must succeed; `Promise.allSettled` for fire-and-forget side effects.
6. **Transactions belong to the service, never to the repository.** Inject `TransactionExecutor` (`src/infrastructure/database/transaction-executor/`, module `TransactionExecutorModule`) and wrap the writes in `run(async (tx) => …)`, passing `tx` as the **last argument** of every repository write inside the callback (`create(data, tx)`, `update(id, data, tx)`). Repositories resolve `tx ? tx.getRepository(Entity) : this.repository` and never open transactions. Pre-checks and the final re-read stay outside; external effects (e-mail, Stripe, cache invalidation) run after the commit. Used by `CreateOrganization`, `StripeWebhook`, `CreateAgent`, `UpdateAgent`.

## External integrations (rule `10`)

`Fonte externa → gateway → contrato Zod → mapeador → contrato interno → domínio`. Everything that leaves the process lives in `src/infrastructure/integration/`; a domain module never imports an SDK, `fetch` or `axios` (`grep -rE "axios|fetch\(" src/modules` must stay empty).

- **Ports.** `PAYMENTS` (Stripe: `createCheckout`, `parseWebhookEvent` → internal `PaymentEvent` union), `MESSAGING` (Twilio SMS/WhatsApp + `parseInboundWhatsapp`), `EMAIL` (SendGrid), `EMBEDDINGS` (LangChain `Embeddings`, Voyage), `VECTOR_STORE` (`upsertChunks` / `loadIndex` / `deleteBySourceId` over Supabase pgvector, returns LangChain `VectorStoreInterface`), `RERANKER` (Voyage `rerank-2.5` via `ResilientClient`), `CHAT_MODEL` (`ChatAnthropic` factory — the only `new ChatAnthropic` in the repo), `SITE_CRAWLER` (Spider), `FILE_STORAGE` (GCS), `TEXT_TO_SPEECH` (Google or ElevenLabs via `TTS_PROVIDER`), `OCR` (Google Vision), `CUSTOMER_DATABASE` (per-request TypeORM `DataSource` to the tenant's DB). Inject by token, type by interface; every interface extends `IntegrationGateway` (`name`, `state()`).
- **External field names stay in `<source>.contracts.ts` / `<source>.mappers.ts`.** `payment_intent`, `latest_charge`, `WaId`, `relevance_score` never appear in `src/modules/`. Mappers are pure and have a spec; a payload outside the contract is rejected (`BadRequestException` on webhooks, `BadGatewayException` on responses), never defaulted.
- **`INTEGRATION_MODE`** (`mock` | `live`): defaults to `mock` when `NODE_ENV=test`, `live` otherwise (deliberate deviation from the rule's `mock` default so a dev `.env` with real keys keeps working). In `mock` every port is an in-memory fake from `integration/mock/` (`MemoryVectorStore`, `FakeListChatModel`, recorded e-mails/SMS). Consumers never change between modes.
- **Missing credentials never break the boot.** A live gateway without its key reports `state() === 'NOT_CONFIGURED'` and throws `ServiceUnavailableException` (503) only when called. `/health/ready` lists every upstream under `checks.integrations` without affecting readiness. Google clients (GCS, TTS, Vision) rely on ADC and are built lazily, so they always report `READY`.
- **`ResilientClient`** (`integration/http-client/`) is the only way to call an HTTP API by hand: `AbortController` timeout, retry with exponential backoff + jitter on `GET`/`HEAD`/`OPTIONS` and 408/425/429/5xx only, circuit breaker per dependency, `redirect: 'error'`, `x-request-id` propagation, SSRF guard (http/https only, blocks loopback/private/link-local/metadata hosts, allowlist `HTTP_ALLOWED_HOSTS`, default `api.voyageai.com`). A new host must be added to the allowlist. SDK-driven calls (Stripe, Twilio, LangChain clients) keep their own HTTP stack — see PC-013.
- **`CUSTOMER_DATABASE`** keeps the per-request `DataSource` but validates the host against `CUSTOMER_DATABASE_ALLOWED_HOSTS` (loopback/private blocked unless `CUSTOMER_DATABASE_ALLOW_INTERNAL_NETWORK=true`) and applies `CUSTOMER_DATABASE_STATEMENT_TIMEOUT_MS` / `CUSTOMER_DATABASE_CONNECTION_TIMEOUT_MS`. The SQL guard (`detectDialect`, `sanitizeSqlQuery`, `assertScoped`) is a pure module, `integration/customer-database/sql-guard.ts`, with its own spec.
- **Env:** `HTTP_TIMEOUT_MS` (10000), `HTTP_RETRIES` (2), `HTTP_BACKOFF_BASE_MS` (200), `HTTP_CIRCUIT_FAILURE_THRESHOLD` (5), `HTTP_CIRCUIT_OPEN_MS` (30000), `HTTP_ALLOWED_HOSTS`, `ANTHROPIC_BASE_URL` (defaults to the DeepSeek Anthropic-compatible endpoint the code hard-coded before; point it at Anthropic explicitly when that is intended), `TTS_PROVIDER`, `GCS_AUDIO_BUCKET`.

## Per-org database connection feature

Single, opt-in mechanism for an agent to query its organization's own database. Replaces the older BravoHub-specific tool belt and the `organization_analytics_config` table. No HTTP gateway in the middle — the tool builds a TypeORM `DataSource` per request against the customer's DB directly.

- **Endpoint:** `POST /support/question` (`src/modules/chat/question/`) is the single entry point for all chat. It streams NDJSON via Fastify response hijacking (`application/x-ndjson`). Declares `@RequirePermissions('chat.ask')` + `@RequireActiveOrganization()`; the global `AuthenticationGuard` accepts both `Authorization` schemes:
  - `Authorization: Bearer <jwt>` → `TokenVerifier` validates the native JWT (user-facing traffic; `request.user` carries `organization_id`).
  - `Authorization: ApiKey <token>` → `TokenVerifier` resolves the token first against the `api_keys` table (hashed, revocable, expirable secret key), then falls back to a `chat_embed_token` (`chat_embed_enabled=true`, via `OrganizationRepository.findActiveByEmbedToken`); `PrincipalResolverService` builds a `role: 'service'` user whose only permission is `chat.ask`. The `role === 'service'` carve-out in `QuestionService` keeps S2S calls **out of credit billing** while still associating them with the right org. (Orgs on an `unlimited` plan are also skipped from billing, regardless of role.)
- **Pré-requisitos para o agente usar a tool de banco** (o gate real em `ResolveAgentService.maybeLoadDatabaseTool`; `chat_embed` **não** faz parte dele — é auth-path, via `ApiKeyGuard`):
  1. Agente com `database_tool = true` e `organization_id` apontando para a org.
  2. `organizations.database_url` populado com uma conn-string (`postgres://...` ou `mysql://...`).
  3. Linha em `organization_features` ligando a org à feature `database_connection` (seedada por SQL aplicado à mão no Supabase) com `enabled = true`.
- **Tool wiring:** `ResolveAgentService.loadTools` (`resolve-agent.service.ts`) faz, para agentes com `database_tool=true`: lookup da org via `OrganizationRepository`, check da feature via `OrganizationFeatureRepository.isEnabledForOrganization(orgId, 'database_connection')`, e injeta `LoadDatabaseToolService.execute({ databaseUrl: org.database_url })`. Qualquer pré-requisito faltando → skip silencioso (a tool não aparece para o LLM).
- **`LoadDatabaseTool`** (`src/modules/retrieval/load-database-tool/`) monta a tool `execute_sql` sobre a porta `CUSTOMER_DATABASE` (`src/infrastructure/integration/customer-database/`), que detecta o dialeto pelo prefixo da URL (`postgres://`/`postgresql://` → Postgres; `mysql://`/`mysql2://` → MySQL), valida o host contra `CUSTOMER_DATABASE_ALLOWED_HOSTS` e abre um `DataSource` TypeORM por chamada com timeouts de `env`. Sanitização em `sql-guard.ts` (função pura com spec): statement única; allow-list do primeiro verbo (`SELECT`/`INSERT`/`UPDATE`; em modo read-only apenas `SELECT`); deny regex `DELETE|ALTER|DROP|CREATE|REPLACE|TRUNCATE` mesmo após verbo permitido; força `LIMIT 5` quando não há LIMIT. Agentes BravoHub-scoped (`env.BRAVOHUB_SCOPED_AGENTS`) rodam company-scoped read-only via `scopeCompanyId`.
- **Knowledge externo (schema do banco do cliente, docs internos):** ingerir como `Source` do agente (via `/agent/load-sites`, OCR ou outras rotas de Source). `LoadVectorSearchTool` (já existente) filtra por `agent_id` na busca semântica.
- **A tabela `documents` e a função `match_documents` vivem só no Supabase.** O diretório `migrations/` foi removido no commit `cfa5375` e `scripts/apply-pgvector-migration.ts` não existe mais — não há nenhum `.sql` versionado no repo. A assinatura em uso é a padrão do LangChain, `match_documents(query_embedding vector, match_count int, filter jsonb)`, retornando `(id, content, metadata, similarity)` com `similarity = 1 - (embedding <=> query_embedding)` (maior = melhor). `synchronize` do TypeORM não toca nisso: não cria a extensão `vector`, o índice cosine nem a função. Qualquer mudança de schema vetorial é aplicada à mão no SQL editor do Supabase.
- **Features migrations:** as tabelas `features` + `organization_features` (com a feature `database_connection` seedada) e a coluna `organizations.database_url` também foram criadas por SQL aplicado à mão. Os arquivos citados por versões antigas deste documento (`migrations/create_features_tables.sql`, `migrations/add_organization_database_url.sql`) **não existem mais no repo** — o estado real está no Supabase.
- **Required env vars:** `ANTHROPIC_API_KEY` (Claude — passado ao `ChatAnthropic` pela `AnthropicChatModelFactory`; sem ele a porta `CHAT_MODEL` fica `NOT_CONFIGURED`), `VOYAGEAI_API_KEY` (usada pelos **dois** adaptadores Voyage: embeddings via `VoyageEmbeddings` e reranker via `ResilientClient`), `EMBEDDING_MODEL` (set to `voyage-3-large`, 1024 dims via `outputDimension` hard-coded em `voyage-embeddings.provider.ts`), `ORCHESTRATOR_MODEL` (default `claude-sonnet-4-6`). Opcionais de retrieval, todos com default em `src/shared/config/env.ts`: `RERANK_MODEL` (`rerank-2.5`), `VECTOR_SEARCH_CANDIDATE_K` (`50`), `VECTOR_SEARCH_MIN_SCORE` (`0.8`), `VECTOR_SEARCH_MAX_RESULTS` (`10`). Não há mais `ANALYTICS_ASK_API_KEY`/`BRAVOHUB_*` — auth S2S é per-org via `chat_embed_token`.

## Tests

- **Two layers, nothing in between.** Unit specs (`src/**/*.spec.ts`, `bun run test`) exist only for pure functions and self-contained pieces: mappers, `sql-guard`, SSRF/backoff/breaker/`ResilientClient` (with a fake `fetch`), `permissions`, `AccessScopeService`, `TokenVerifier`, `VoyageRerankCompressor`, utils, plus the two Nest-module integration specs `auth-layer.spec.ts` and `http-layer.spec.ts` (guards and filter wired in a `TestingModule`, no database). A service spec that mocks a repository is **not** added: its behaviour is covered end to end in `test/<domain>.e2e-spec.ts`.
- **One e2e file per domain** (`test/*.e2e-spec.ts`, `bun run test:e2e`, serial via `--runInBand`): `health`, `auth-flows`, `organizations`, `members`, `api-keys`, `agents` (with connections), `sources`, `chat`, `billing`, `reports`, `sessions`, `users`, `voice-and-whatsapp`. Each use case gets the happy path, a validation error (400 `ErrorResponse` with `details`), 401 without token, 403 without the permission or outside the organization, and 404 where it applies. The real `AppModule` boots on Fastify through `test/support/test-app.ts` (same `createFastifyAdapter()` + `createValidationPipe()` as `main.ts`), with `INTEGRATION_MODE=mock`, so every port is the in-memory fake: Stripe events are the JSON body of `POST /payment/webhook` (signature ignored by the mock), the chat model is `FakeListChatModel`, the vector store is `MemoryVectorStore`.
- **Database.** `test/global-setup.ts` takes `TEST_DATABASE_URL` (CI uses a `postgres:16-alpine` service container; locally `docker compose up postgres` or any Postgres 16) and otherwise starts a Testcontainers Postgres when Docker is available. It then runs `scripts/test/prepare-database.ts` (ts-node/CommonJS, PC-006): `dropSchema` + `synchronize` from the entities and inserts the `migrations` rows so `/health/startup` is green — there is no baseline migration (PC-017), so tests never run `db:migrate`. `test/setup-env.ts` forces `NODE_ENV=ENV=test`, `INTEGRATION_MODE=mock`, `LOG_LEVEL=fatal`. Every spec truncates all tables in `beforeEach` (`TestApp.reset()`); fixtures come from `test/support/factories.ts` (`createOrganization`, `createUser`, `createAgent` with instructions, `createApiKey`, `tokenFor`/`bearer` signing a native JWT) — never insert rows by hand in a spec.
- **`DevtoolsModule` is skipped in tests** (PC-018); `MemoryHealthIndicator` compares against `heap_size_limit`, not `heapTotal`.

## Things that bite

- **Schema changes go through TypeORM migrations; `synchronize` is off.** Entities in `src/infrastructure/database/schema/` describe the schema, `src/infrastructure/database/migrations/*.ts` (registered in `migrations/index.ts` as `MIGRATIONS`) change it, and `src/infrastructure/database/data-source.ts` is the CLI DataSource. Flow: change the entity → `bun run db:generate src/infrastructure/database/migrations/<timestamp>-<name>` against a database that mirrors production → review the generated SQL (additive whenever possible, `CREATE INDEX CONCURRENTLY` + `transaction = false` for indexes on big tables) → commit entity and migration together. `bun run db:check` fails when entities and database diverge; `db:migrate` / `db:revert` / `db:show` run the CLI. Migrations never run at boot: the `migrate` job in `.github/workflows/ci-cd.yml` runs `db:migrate` (concurrency 1) before `gcloud run deploy`, and `/health/startup` answers 503 while any migration is pending. **Every table carries `deleted_at`** (`@DeleteDateColumn`) except the trails `token_usage` and `credit_transactions`; repositories use `softDelete`, never `delete`/`remove`, and TypeORM filters `deleted_at IS NULL` automatically on `find*`, `count` and query builders (raw `from('table')` subqueries do not). Unique constraints are **partial** (`@Index(name, cols, { unique: true, where: '"deleted_at" IS NULL' })`). The `documents` table, the `match_documents` function and the pgvector index still live only in the Supabase project.
- **Retrieval can legitimately return nothing.** `vector_similarity_search` is no longer top-K: the dense search fetches `VECTOR_SEARCH_CANDIDATE_K` candidates (default 50) purely for recall, and a Voyage `rerank-2.5` cross-encoder keeps only those scoring `>= VECTOR_SEARCH_MIN_SCORE` (default 0.8), capped at `VECTOR_SEARCH_MAX_RESULTS`. A question where nothing clears the bar yields an empty string to the LLM **by design** — `VoyageRerankCompressor` logs a `warn` with the best score seen, which is the signal to tune the env var rather than to remove the threshold. Never move the cutoff onto the cosine score: `match_documents` already orders rows by exactly that value, so filtering on it adds no signal, and a bi-encoder's scale is not comparable across queries.
- **A search costs two Voyage calls now** (one embed + one rerank) against the **same** `VOYAGEAI_API_KEY` quota. Rate limits are org-wide and tier-based: with no _default_ payment method every model group is capped at **3 RPM / 10K TPM** and the 429 body reads `"You have not yet added your payment method"`. Tier 1 (a default card) lifts `voyage-3-large` to 3M TPM / 2000 RPM and `rerank-2.5` to 2M TPM / 2000 RPM, keeping the 200M free rerank tokens. Two traps: a card can sit in the dashboard **without being the default** and not count, and after fixing it the dashboard flips several minutes before the enforcement layer does — verify with a burst of concurrent calls, never with the dashboard.
- **`ContextualCompressionRetriever` must come from `@langchain/classic`**, not `langchain` (the classic retrievers moved packages; `langchain@1.2.x` no longer exports them). And the `as unknown as BaseRetrieverInterface` cast in `execute-similarity-search.service.ts` is load-bearing: under `NodeNext`, `@langchain/community` resolves its CJS typings back to the ESM ones, so both packages see the same declaration under two identities. Removing the cast breaks `bun run build`.
- **Auth is global; every route is private by default.** `AuthModule` (`src/auth/auth.module.ts`) registers two `APP_GUARD`s, in this order: `AuthenticationGuard` then `AuthorizationGuard`. **No controller uses `@UseGuards`** (the only exception is `ThrottlerGuard` on the SMS routes, which is rate limiting, not auth). Every handler declares exactly one of `@Public()` or `@RequirePermissions(...)` (`src/shared/decorators/`); a route with neither answers 403.
  - `TokenVerifier` (`src/auth/token.verifier.ts`) is the only class that knows token formats: native HS256 JWT signed with `env.JWT_SECRET` (issued by `GenerateTokenService`), the forwarded BravoHub HS512 token (`env.BRAVOHUB_JWT_SECRET`), and `Authorization: ApiKey <token>` resolved against `api_keys` (`findValidByHash(sha256)`) with fallback to the organization `chat_embed_token`. Any failure → `UnauthorizedException`.
  - `PrincipalResolverService` turns the verified principal into `AuthenticatedUser` (`src/auth/authenticated-user.ts`): `id`, `role` (`admin` | `user` | `guest` | `service`), `org_role`, `organization_id` (`''` for a JWT without org, as before), `organization_status` (looked up per org and cached for `AUTH_PRINCIPAL_CACHE_TTL_MS`; `Activate/DeactivateOrganization` call `invalidateOrganization`), `companyId` for BravoHub, `api_key_id`/`scopes` for keys, and `permissions`.
  - **Permissions are derived, not stored**: `src/auth/permissions.ts` is the catalog (`agent.read`, `agent.manage`, `organization.manage`, `member.manage`, `api-key.manage`, `chat.ask`, `account.access`, …) with one grant predicate per key over `(role, org_role)`. Platform `admin`/`user` are staff; `guest` has `account.access` + chat; `service` has only `chat.ask`; `member.manage` and `api-key.manage` follow `org_role` (`owner`/`admin`). Add a key there before using it in a controller — the decorator is typed.
  - `@RequireActiveOrganization()` makes `AuthorizationGuard` reject users whose `organization_status` is `inactive` (chat and conversation routes). `ResolveAgentService` additionally refuses agents whose organization is inactive.
  - **Resource scope lives in services**, never inline: inject `AccessScopeService` (import `AuthModule`) and call `ensureCan(user, permission, { organizationId }, message)`. Platform `admin` passes any organization; everyone else must match `organization_id`.
- **Whitelabel auth model (multi-user + plans + API keys).** Org-scoped roles live on `users.org_role` (`owner` > `admin` > `member`), carried in the JWT and granted as `member.manage` / `api-key.manage` by the permissions catalog. Plan benefits live on `PlanEntity`: `max_agents` / `max_users` (`null` = unbounded), `unlimited` (bypasses credit billing **and** quotas — used by the MAIA playground), and `monthly_credits` (granted on org creation). API keys: `api_keys` table + `ApiKeyRepository`, CRUD under `src/modules/api-keys/` (`POST /api-key/{create,list,revoke}`, owner/admin only). Member invites under `src/modules/members/` (`POST /organization/members/{invite,accept,list,role,remove}`). Seed the MAIA org + base plans with `bun run seed:maia` (ts-node/CommonJS — running the script directly under bun's ESM loader hits a TypeORM `emitDecoratorMetadata` TDZ).
- **No global API prefix.** Routes are mounted at the path declared on each `@Controller(...)` (e.g., `/support/question`), not `/api/...`. Health lives at `/health/startup`, `/health/live`, `/health/ready` (`src/shared/http/health/`); the old `GET /health` is gone. Swagger UI at `/docs` only when `SWAGGER_ENABLED=true` outside production.
- **Bootstrap order is fixed** (`src/main.ts`): `dotenv/config` → `createFastifyAdapter()` (helmet without CSP/frameguard so the embed widget keeps working, multipart, `x-request-id` correlation via one `AsyncLocalStorage` in `src/shared/observability/correlation.ts`) → `nestjs-pino` logger (`AppLoggerModule`, redacts auth headers and secrets, skips `/health`) → CORS from `ALLOWED_ORIGINS` (empty = reflect any origin, required by the public widget; `*` is rejected) → global pipe → shutdown hooks → Swagger → listen. Use Nest `Logger` everywhere; `console.*` is a lint error.
- **`.env` is git-ignored; `.env.example` is the documented template.** Every variable lives in the Zod schema in `src/shared/config/env.ts` (`import { env } from 'src/shared/config/env'`); `process.env` is read nowhere else (ESLint has no rule for it yet — review for it). Missing `DATABASE_URL` or `JWT_SECRET`, or an invalid value, aborts the boot listing every problem. New variable → add to the schema **and** to `.env.example`. Never paste secret values into messages or commits.
- **TS is `strict`** (`strict`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `forceConsistentCasingInFileNames`), including specs. Entities and DTOs use `!` definite assignment (TypeORM/class-validator hydrate them). `@typescript-eslint/no-explicit-any` is an **error** outside `*.spec.ts`: reach for `unknown`, a `Record<string, unknown>`, a `Pick<>` or a named interface instead. `AuthenticatedUser.id` / `organization_id` are `string | null`; a handler that needs them non-null calls `requireUserId(user)` / `requireOrganizationId(user)` (`src/auth/request-user.ts`, 403 when absent) instead of `!`. Three casts are deliberate and documented: TypeORM `update()` payloads (`as QueryDeepPartialEntity<Entity>`, PC-015), Fastify plugin registration (`as unknown as AdapterPlugin`, PC-016) and the LangChain dual-identity ones (PC-005, PC-012). `isolatedModules` stays **off** on purpose (PC-014).
- **`eslint-plugin-import` enforces order**: builtin → external → internal (`src/...`) → parent → sibling → index, alphabetized, blank line between groups. `bun run lint:fix` resolves most violations automatically. Also enforced as errors: `no-console` (use Nest `Logger`), kebab-case file and folder names under `src/`, no relative imports (`./`, `../`) outside `infrastructure/database/schema/`, `no-inline-comments`, `no-warning-comments`, and `@typescript-eslint/consistent-type-imports` (`import type` / inline `type` for anything used only as a type; the rule knows about `emitDecoratorMetadata` and keeps a value import for classes injected through a decorated constructor, so never force `import type` on those).
- **No comments in `src/`.** `bun run lint` ends with `lint:comments` (`scripts/lint/no-comments.ts`, TypeScript-parser based, so regexes and template strings are safe); any comment other than an `eslint`/`@ts-`/`prettier` directive fails CI. Intent goes into names, types and `it(...)` titles; knowledge that used to live in comments is in `docs/decisoes-de-dominio.md`, and library quirks in `docs/problemas-conhecidos.md`. `bun run lint:comments --fix` strips them.
- **`bravohub-analytics-workspace/CLAUDE.md` doesn't apply here.** Its scope rule says it only fires when `pwd` ends in `bravohub-analytics-workspace`. When `cd`'d into `split-ai/`, this file takes over.

## Commit & CI

- Conventional Commits enforced by commitlint (`build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test`). Subject in lowercase, no trailing period, blank line before body.
- Husky `pre-commit` runs `lint-staged` → ESLint + Prettier on staged files (specs excluded from ESLint).
- `.github/workflows/ci-cd.yml`: PRs run `format:check`, `lint`, `typecheck`, `test`, `test:e2e` (against a `postgres:16-alpine` service container, `TEST_DATABASE_URL`) and `build`. Pushes to `main` build a Docker image, push to Artifact Registry, and `gcloud run deploy split-ai` in `southamerica-east1` with `min-instances 1, max-instances 2, 4Gi, 4 CPU`. The Cloud Run service binds to `$PORT`, which is why `env.PORT` has no hard-coded production value.
