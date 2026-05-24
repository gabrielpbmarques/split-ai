# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About this project

`split-ai` is a **third project** living inside `bravohub-analytics-workspace/`, alongside `bravohub-analytics` and `bravohub-analytic-frontend`. The workspace `CLAUDE.md` one level up does **not** mention it — that file only describes the other two. Treat this file as authoritative when working under `split-ai/`.

It's a NestJS 10 + Fastify backend for an AI assistant product (chat, OCR, source ingestion, voice, WhatsApp, billing). The AI pipeline is built on LangChain / LangGraph with Anthropic Claude models for chat and Voyage AI `voyage-3-large` (1024 dims) for embeddings; vector storage in Supabase/pgvector, and PostgreSQL (also hosted on Supabase) as the primary store via TypeORM. It is independent of the BravoHub products — no shared database, no shared auth contract.

## Package manager

**Use `bun`.** The lockfile is `bun.lock`, the Dockerfile uses `bun`, and CI runs `bun install && bun run lint`. The README's `bun install` line is correct; the `package.json` scripts call `nest`/`jest` directly so they work under either bun or npm, but stay on bun to keep the lockfile honest.

## Commands

```bash
bun install                                 # install deps
bun run start:dev                           # watch mode (default port 4000)
bun run start:prod                          # run compiled dist/main
bun run build                               # nest build → dist/
bun run lint                                # eslint --fix on src,test
bun run test                                # jest (unit)
bun run test:e2e                            # jest with test/jest-e2e.json
bun run test:cov                            # coverage
bun jest src/path/to/file.spec.ts           # single file
bun jest -t "test name fragment"            # single test by name
docker compose up                           # api + local Redis

# BravoHub analytics integration (one-off setup; runs via bun, not nest)
bun run analytics:compile-toro-docs         # concatenate data/docs/modules/**/*.md → data/docs/compiled/toro-business-knowledge.md
bun run analytics:ingest-schema             # embed data/schema/bravohub-database.sql into pgvector
bun run analytics:ingest-domain             # embed domain/business-context docs
bun run analytics:seed-agents               # upsert analytics-oracle / narrate-executive / recommend-plan
bun run analytics:bootstrap                 # ingest-schema → ingest-domain → seed-agents (does NOT run compile-toro-docs)
```

The dev server defaults to **port 4000** (`PORT || 4000` in `src/main.ts`). The README's NestJS-template snippets imply 3000 — ignore them.

## Auto-loaded skills

`.claude/skills/` contains twelve SKILL.md files that auto-load when working here. They split into three groups:

**General (read before scaffolding new code):**

- `main-instructions` — quick stack reference
- `architecture` — module hierarchy, scope/use-case pattern, repository/provider patterns
- `code-patterns` — controller/service/DTO templates, error handling, parallel async
- `import-and-naming-conventions` — paths, suffixes, casing, commit format
- `tech-stack` — every external integration, token, and env var
- `thinking-flow` — how to approach problems before coding

**AI pipeline (most engineering work here lives in this stack — LangChain/LangGraph + Voyage AI embeddings + Supabase pgvector):**

- `agent-end-to-end-flow` — the cross-cutting map: `POST /agent/create` and source ingestion → `POST /support/question` / `/chat/attendant` → `ResolveAgent` → `GenerateAIResponse` → LangGraph runnable → tools → pgvector → persistence/billing. **Start here for any change that crosses the AI areas below.**
- `ai-agent-configuration` — agent CRUD, `AIInstructions`, prompt construction, parser schemas, `agents` / `agents_instructions` tables
- `ai-agent-runtime` — `ResolveAgent`, `GenerateAIResponse`, LangGraph streaming, structured responses, `thread_id` memory via `PostgresSaver`, LangSmith tracing
- `ai-agent-tools-and-rag` — LangChain tools (`vector_similarity_search`, `execute_sql` with guardrails, parser), pgvector behavior, Spider ingestion, embeddings via Voyage AI `voyage-3-large`
- `ai-chat-flows` — `src/components/AIChat/`, the `/support/question` SSE-like streaming endpoint, `/chat/attendant`, Fastify response hijacking, session/credit/message persistence

**Model integration:**

- `langchain-anthropic-integration` — how to wire `ChatAnthropic` from `@langchain/anthropic`, and how to migrate call-sites from `ChatVertexAI`. Read this before swapping the LLM provider in any agent or use case.

**Read the relevant skill before scaffolding new code.** This file intentionally doesn't restate them.

## Architecture in one screen

```
src/
  main.ts                    Fastify bootstrap, request/response logging, Sentry in prod
  app.module.ts              Root — TypeOrmModule.forRoot, Components, Infrastructure, Health
  config.ts                  Plain object reading process.env (not @nestjs/config registerAs)
  auth/                      AuthGuard, ActiveOrgGuard
  decorators/                @Roles, @User (alias as AuthUser in controllers)
  entities/                  TypeORM entities + barrel index.ts
  repositories/              Repository wrappers + RepositoriesModule (registers ALL entities)
  infrastructure/providers/  External SDK wrappers (Voyage embeddings, GCS, Twilio, SendGrid, Stripe,
                             Supabase, Spider, Google TTS)
  components/                Feature modules — PascalCase Scope/ → PascalCase UseCase/ → kebab-case files
                             Notable scopes: AIChat/, ArtificialIntelligence/, Tools/ (the BravoHub-MySQL
                             tool belt — explore-schema, describe-table, validate-sql, execute-sql,
                             business-context — see "BravoHub analytics integration" below), Organization/,
                             Source/, Session/, Credits/, Payment/, Whatsapp/, OCR/, etc.
  health/                    Liveness endpoint
  observability/             Sentry init
  services/                  One-off non-NestJS helpers (e.g., cep.service.ts axios wrapper) —
                             NOT the home for feature services; those live under components/
  types/models/              Plain TS interfaces + barrel
  utils/                     Pure helper functions
migrations/                  Raw SQL migration files — applied by hand, NOT TypeORM migrations
```

**Hard rules** (also in skills, repeated here because they are the most common review feedback):

1. Modules import `RepositoriesModule` and `InfrastructureModule` **as wholes** — never individual repositories or provider tokens at the module level.
2. One use case = one module = one controller = one endpoint. Controller handler is `handle` or `execute`; service public method is `execute`.
3. Controllers always use `@Res() res: FastifyReply` and a try/catch — never rely on Nest's default response handling.
4. DTOs validated via `class-validator` with `@Body(new ValidationPipe())` per-handler (there is no global `ValidationPipe`).
5. User-facing error messages are in Portuguese; identifiers stay English.
6. Every new entity must be registered in `RepositoriesModule`'s `TypeOrmModule.forFeature([...])` AND in `src/entities/index.ts`.

## BravoHub analytics integration

This is the **one place where `split-ai` reaches into the BravoHub product** — everything else in this repo is self-contained. If a task touches the analytics tool belt, the consolidated `/support/question` endpoint, or the `bravohub-analytics` workspace sibling, read this section first.

The integration was reshaped by the `feat/tenant-agnostic-tools-and-chat-consolidation` merge: there is **no longer a dedicated `/analytics/ask` endpoint** and **no longer a `LoadAnalyticsToolsService`**. Analytics queries flow through the same chat endpoint as everything else, and the tool belt is gated per-agent (any agent, any combination) and configured per-organization (any tenant, any tenant-filter column).

- **Endpoint:** `POST /support/question` (`src/components/AIChat/Question/`) is the single entry point for all chat, analytics included. It streams NDJSON via Fastify response hijacking (`application/x-ndjson`). The handler is guarded by **`CompositeAuthGuard`** (`src/auth/composite-auth.guard.ts`), which dispatches on the `Authorization` scheme:
  - `Authorization: Bearer <jwt>` → `AuthGuard` (user-facing browser/app traffic; `request.user` is the JWT payload, including `organization_id`).
  - `Authorization: ApiKey <ANALYTICS_ASK_API_KEY>` → `ApiKeyGuard` (server-to-server from `bravohub-analytic-frontend` / `bravohub-analytics`). The guard synthesizes a service-user with `id`, `organization_id`, and `email` all `null` — so API-key callers **must pass `organizationId` (preferred) or `companyId` in the request DTO**, otherwise `QuestionService.execute` throws `BadRequestException('organizationId ou companyId é obrigatório quando autenticado via ApiKey.')`. Service-caller traffic also **skips credit consumption** (the `user.organization_id`-gated check in `QuestionService`).
- **Three reserved agent identifiers:** `analytics-oracle`, `narrate-executive`, `recommend-plan` — seeded by `scripts/seed-analytics-agents.ts`. They are no longer hard-coded constants anywhere in `src/`; they're plain rows in the `agents` table referenced by `agent_identifier`. `ResolveAgentService` accepts either a UUID `id` or an `agent_identifier` (`resolve-agent.service.ts:44`). Seed via `bun run analytics:seed-agents` — do not create them by hand through the agent CRUD UI, since the script also wires their `analytics_*` boolean columns and instructions.
- **Tools are tenant-agnostic and gated by per-agent boolean columns on `agents`:** `analytics_explore_schema`, `analytics_describe_table`, `analytics_validate_sql`, `analytics_execute_sql`, `analytics_business_context`. `ResolveAgentService.loadTools` (`resolve-agent.service.ts:113`) reads those flags and injects the corresponding tool service from `src/components/Tools/` (`ExploreSchemaToolService`, `DescribeTableToolService`, `ValidateSqlToolService`, `ExecuteSqlToolService`, `BusinessContextToolService`). Any agent can opt in to any combination — `analytics-oracle` enables all five today, but nothing in code restricts the tool belt to that identifier. An agent that enables any analytics tool **must** have an `organization_id`; otherwise `loadTools` throws.
- **`Tools/*` ≠ `LoadDatabaseTool`.** `LoadDatabaseTool` (`src/components/ArtificialIntelligence/LoadDatabaseTool/`) targets the **local Supabase Postgres** with the `node-sql-parser` guardrails described in the `ai-agent-tools-and-rag` skill. The `Tools/*` services target the **remote BravoHub MySQL** via the `BravohubAnalyticsService` HTTP gateway (`src/infrastructure/providers/bravohub-analytics.provider.ts`) — `POST /api/sql/exec` on the `bravohub-analytics` Cloud Run service with an `ApiKey` header. The remote DB is MySQL 5.7 (no CTEs, no window functions); the local one is Postgres. Do not confuse the two.
- **Per-organization config lives in `organization_analytics_config`** (`src/entities/organization-analytics-config.entity.ts`): `sql_gateway_url`, `sql_gateway_api_key`, `tenant_filter_column` (default `company_id`), `tenant_filter_value`, `database_dialect` (default `mysql-5.7`). `ExecuteSqlToolService` constructs `BravohubAnalyticsService` per call from this row — **not from env vars** — and `ValidateSqlToolService` rejects any query that doesn't restrict on `<tenant_filter_column> = <tenant_filter_value>`. The `BRAVOHUB_ANALYTICS_BASE_URL` / `BRAVOHUB_SQL_GATEWAY_API_KEY` env vars are still read in `config.ts` and the provider constructor, but the tool path no longer uses them; treat them as legacy fallbacks. If a tool returns `NO_CONFIG` or `NO_API_KEY`, the org needs a row in `organization_analytics_config`.
- **Schema and domain context come from ingested docs, not live introspection.** `bun run analytics:ingest-schema` reads `data/schema/bravohub-database.sql` (a hand-maintained snapshot of the BravoHub MySQL schema, mirroring `bravohub-analytics/docs/database/bravohub-database.sql` in the sibling repo) and embeds chunks into pgvector. `bun run analytics:ingest-domain` does the same for business-context docs under `data/docs/`. `bun run analytics:compile-toro-docs` is an upstream step that concatenates `data/docs/modules/**/*.md` (plus a few siblings) into `data/docs/compiled/toro-business-knowledge.md` — run it before `analytics:ingest-domain` if the Toro source set changed. The `explore-schema` and `business-context` tools are pgvector similarity searches over those embeddings. If the snapshot drifts from production, the oracle will hallucinate columns — re-ingest after upstream schema changes.
- **pgvector migration is applied manually.** `migrations/create_documents_pgvector.sql` is run via `bun run scripts/apply-pgvector-migration.ts` — TypeORM `synchronize` does not create the `vector` extension or the cosine-distance index. Run it once per Supabase environment.
- **Required env vars:** `ANALYTICS_ASK_API_KEY` (inbound API-key auth on `/support/question`; despite the legacy name, this is no longer scoped to a removed `/analytics/ask` route), `ANTHROPIC_API_KEY` (Claude — read by `ChatAnthropic` automatically), `VOYAGEAI_API_KEY` (Voyage embeddings — read by `VoyageEmbeddings` automatically), `EMBEDDING_MODEL` (set to `voyage-3-large`, 1024 dims via `outputDimension` hard-coded in `voyage-embeddings.provider.ts`), `ORCHESTRATOR_MODEL` (defaults to `claude-sonnet-4-6`). Missing `ANALYTICS_ASK_API_KEY` makes every `ApiKey`-scheme request fail with "Serviço não configurado"; missing `ANTHROPIC_API_KEY` surfaces as a 401 from Anthropic on the first agent invocation; missing `VOYAGEAI_API_KEY` surfaces as a 401 on any `explore_schema` / `business_context` call. `BRAVOHUB_ANALYTICS_BASE_URL` / `BRAVOHUB_SQL_GATEWAY_API_KEY` are now per-org config (see above) — do not rely on them for new code. **Note:** without a payment method on the Voyage dashboard, the free tier is capped at **3 RPM** — bulk ingestion will fail with cryptic `undefined is not an object` because LangChain's `VoyageEmbeddings` swallows 429 errors. Add a card on `dash.voyageai.com/billing` to unlock 2000 RPM (still within free credit).

## Things that bite

- **`synchronize: true` is enabled** (`src/app.module.ts:24`). Schema is reflected from entity decorators on every boot — including against the Supabase production DB if those credentials are used. Be careful: renaming a column or changing a type on an entity will alter the live schema. Coordinate schema changes via the SQL files in `migrations/` and discuss before touching entities pointed at prod. **Note:** the pgvector migration (`create_documents_pgvector.sql`) is NOT picked up by `synchronize` — it must be applied manually via `bun run scripts/apply-pgvector-migration.ts`.
- **Three auth guards coexist; pick the right one.** There is no global guard — every handler picks per-`@UseGuards`.
  - `AuthGuard` (`src/auth/auth.guard.ts`) — JWT-only. Protects almost everything.
  - `ApiKeyGuard` (`src/auth/api-key.guard.ts`) — checks `Authorization: ApiKey <ANALYTICS_ASK_API_KEY>` with a timing-safe compare. Does **not** populate `request.user`.
  - `CompositeAuthGuard` (`src/auth/composite-auth.guard.ts`) — dispatches on the `Authorization` scheme to one of the above; for the `ApiKey` path it synthesizes a service-user with `id`/`organization_id`/`email` set to `null` so downstream handlers can branch on `user.organization_id` to detect server-to-server traffic. This is what `/support/question` uses today, which is why that endpoint accepts both browser and service callers. When you wire a new endpoint, also register both `AuthGuard` and `ApiKeyGuard` as providers in the use-case module — `CompositeAuthGuard` depends on them via DI.
- **`AuthGuard` does NOT verify the JWT signature.** `parseJwt` in `src/auth/auth.guard.ts:85` just base64-decodes the payload. Any well-formed JWT is accepted. This is a real security gap — flag it if the task touches auth, but don't silently "fix" it without confirming, since downstream services may depend on the current behavior. `JWT_SECRET` and `JWT_EXPIRATION` env vars exist but aren't used by this guard. (`ApiKeyGuard` is the one place where credentials are actually checked, via the timing-safe comparison above.)
- **No global API prefix.** Routes are mounted at the path declared on each `@Controller(...)` (e.g., `/support/question`), not `/api/...`. The `main-instructions` skill says otherwise — the code wins.
- **`.env` is checked in with live secrets** (Supabase service key, Stripe live keys, Twilio credentials, LangSmith keys). Don't echo, log, paste into messages, or commit changes that move them. If a task needs new secrets, edit `.env` locally but don't commit; surface the variable name in the PR description instead.
- **TS is loose**: `strictNullChecks: false`, `noImplicitAny: false`, `@typescript-eslint/no-explicit-any: off`. Write type-safe code anyway, but don't waste time fighting `any` in existing files unless the task is a cleanup.
- **`eslint-plugin-import` enforces order**: builtin → external → internal (`src/...`) → parent → sibling → index, alphabetized, blank line between groups. `bun run lint --fix` resolves most violations automatically.
- **`bravohub-analytics-workspace/CLAUDE.md` doesn't apply here.** Its scope rule says it only fires when `pwd` ends in `bravohub-analytics-workspace`. When `cd`'d into `split-ai/`, this file takes over.

## Commit & CI

- Conventional Commits enforced by commitlint (`build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test`). Subject in lowercase, no trailing period, blank line before body.
- Husky `pre-commit` runs `lint-staged` → ESLint + Prettier on staged files (specs excluded from ESLint).
- `.github/workflows/ci-cd.yml`: PRs run lint only. Pushes to `main` build a Docker image, push to Artifact Registry, and `gcloud run deploy split-ai` in `southamerica-east1` with `min-instances 1, max-instances 2, 4Gi, 4 CPU`. The Cloud Run service binds to `$PORT`, which is why `main.ts` reads `process.env.PORT` first.
