# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About this project

`split-ai` is a **third project** living inside `bravohub-analytics-workspace/`, alongside `bravohub-api` and `bravohub-analytic-frontend`. The workspace `CLAUDE.md` one level up does **not** mention it — that file only describes the other two. Treat this file as authoritative when working under `split-ai/`.

It's a NestJS 10 + Fastify backend for an AI assistant product (chat, OCR, source ingestion, voice, WhatsApp, billing). The AI pipeline is built on LangChain / LangGraph with Anthropic Claude models for chat and Voyage AI `voyage-3-large` (1024 dims) for embeddings; vector storage in Supabase/pgvector, and PostgreSQL (also hosted on Supabase) as the primary store via TypeORM. It is independent of the BravoHub products — no shared database, no shared auth contract. Tenant-specific data access is opt-in via the per-org `database_url` + the `database_connection` feature flag (see "Per-org database connection feature" below).

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
```

The dev server defaults to **port 4000** (`PORT || 4000` in `src/main.ts`). The README's NestJS-template snippets imply 3000 — ignore them.

## How guidance is organized: rules, scoped-rules, skills

Project guidance lives at three loading tiers. Pick the right tier when adding new guidance:

- **Rules — always-on.** This `CLAUDE.md` (root) is the single source of truth for universal invariants: the "Hard rules", "Things that bite", "Service & reasoning conventions", and the per-org DB feature. Skills must **point to** these, not restate them.
- **Scoped-rules — auto-load by path.** A nested `CLAUDE.md` inside a subtree loads only when you touch files there. They stay thin: a handful of must-not-break invariants + a pointer to the deep skill. They exist so subsystem gotchas surface without the model having to remember to open a skill:
  - `src/CLAUDE.md` — scaffolding index (points to `architecture` / `code-patterns` / `import-and-naming-conventions`).
  - `src/components/AIChat/CLAUDE.md` — chat-streaming invariants (→ `ai-chat-flows`).
  - `src/components/ArtificialIntelligence/CLAUDE.md` — agent config/runtime invariants (→ `ai-agent-configuration` / `ai-agent-runtime`).
  - `src/components/Tools/CLAUDE.md` — tool + SQL-guardrail invariants (→ `ai-agent-tools-and-rag`).
- **Skills — on-demand.** `.claude/skills/` holds eleven SKILL.md files. Only the one-line `description` is in context each turn (it competes for a small budget — keep descriptions short and trigger-led); the body loads when invoked. Use skills for depth and worked examples.

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
- `ai-agent-tools-and-rag` — LangChain tools (`vector_similarity_search`, `execute_sql` with guardrails, parser), pgvector behavior, Spider ingestion, Voyage `voyage-3-large` embeddings
- `ai-chat-flows` — `src/components/AIChat/`, the `/support/question` NDJSON streaming endpoint, `/chat/attendant`, Fastify response hijacking, session/credit/message persistence

**Model integration:**

- `langchain-anthropic-integration` — wiring `ChatAnthropic` from `@langchain/anthropic` and migrating call-sites from `ChatVertexAI`. Read before swapping the LLM provider. (For Claude model IDs/pricing, use the `claude-api` skill; for other library docs, prefer context7.)

**Read the relevant skill before scaffolding new code.** This file intentionally doesn't restate skill bodies.

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
                             Notable scopes: AIChat/, ArtificialIntelligence/, Tools/ (just LoadDatabaseTool
                             + LoadVectorSearchTool — generic, tenant-agnostic), Organization/,
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

## Service & reasoning conventions

How to think about a service before writing it (worked before/after examples in the `thinking-flow` skill):

1. **Push work to the database/repository.** Don't fetch full rows and discard fields in TS — add an optional `select` (or a dedicated query) so the repository returns exactly what's needed. Prefer one optimized query over in-service transformation.
2. **Type every public method's return explicitly.** Each `execute()` declares its return type; for a strict subset of an entity, define a `Pick<>` type in `src/types/models/` and barrel-export it.
3. **Skip checks the call chain already guarantees.** `AuthGuard` guarantees `user`; `@Body(new ValidationPipe())` guarantees required DTO fields; a prior `NotFoundException` guarantees the entity exists. Don't re-check them.
4. **Early return; keep the happy path flat.** Validate and throw `NestJS` exceptions at the top, then proceed. Don't catch in services — let exceptions bubble to the controller's try/catch.
5. **Parallelize independent async work.** `Promise.all` when all must succeed; `Promise.allSettled` for fire-and-forget side effects.

## Per-org database connection feature

Single, opt-in mechanism for an agent to query its organization's own database. Replaces the older BravoHub-specific tool belt and the `organization_analytics_config` table. No HTTP gateway in the middle — the tool builds a TypeORM `DataSource` per request against the customer's DB directly.

- **Endpoint:** `POST /support/question` (`src/components/AIChat/Question/`) is the single entry point for all chat. It streams NDJSON via Fastify response hijacking (`application/x-ndjson`). Guarded by **`CompositeAuthGuard`** (`src/auth/composite-auth.guard.ts`), which dispatches on the `Authorization` scheme:
  - `Authorization: Bearer <jwt>` → `AuthGuard` (user-facing browser/app traffic; `request.user` is the JWT payload, including `organization_id`).
  - `Authorization: ApiKey <token>` → `ApiKeyGuard` (server-to-server). The guard resolves the token first against the `api_keys` table (hashed, revocable, expirable secret key), then falls back to a `chat_embed_token` (`chat_embed_enabled=true`, via `OrganizationRepository.findActiveByEmbedToken`), and populates `request.user` with the resolved `organization_id` plus `role: 'service'`. The `role === 'service'` carve-out in `QuestionService` keeps S2S calls **out of credit billing** while still associating them with the right org. (Orgs on an `unlimited` plan are also skipped from billing, regardless of role.)
- **Pré-requisitos para o agente usar a tool de banco:**
  1. `organizations.chat_embed_enabled = true` + `chat_embed_token` definido (a chave de API per-org).
  2. `organizations.database_url` populado com uma conn-string (`postgres://...` ou `mysql://...`).
  3. Linha em `organization_features` ligando a org à feature `database_connection` (seedada em `migrations/create_features_tables.sql`) com `enabled = true`.
  4. Agente com `database_tool = true` e `organization_id` apontando para a org.
- **Tool wiring:** `ResolveAgentService.loadTools` (`resolve-agent.service.ts`) faz, para agentes com `database_tool=true`: lookup da org via `OrganizationRepository`, check da feature via `OrganizationFeatureRepository.isEnabledForOrganization(orgId, 'database_connection')`, e injeta `LoadDatabaseToolService.execute({ databaseUrl: org.database_url })`. Qualquer pré-requisito faltando → skip silencioso (a tool não aparece para o LLM).
- **`LoadDatabaseTool`** (`src/components/Tools/LoadDatabaseTool/`) detecta o dialeto pelo prefixo da URL (`postgres://`/`postgresql://` → Postgres; `mysql://`/`mysql2://` → MySQL). Constrói o `DataSource` lazy via TypeORM por chamada. Sanitização: bloqueia DELETE/ALTER/DROP/CREATE/REPLACE/TRUNCATE, exige statement única, força `LIMIT 5` quando não há LIMIT.
- **Knowledge externo (schema do banco do cliente, docs internos):** ingerir como `Source` do agente (via `/agent/load-sites`, OCR ou outras rotas de Source). `LoadVectorSearchTool` (já existente) filtra por `agent_id` na busca semântica.
- **pgvector migration is applied manually.** `migrations/create_documents_pgvector.sql` é aplicada via `bun run scripts/apply-pgvector-migration.ts` — `synchronize` do TypeORM não cria a extensão `vector` nem o índice cosine.
- **Features migrations:** `migrations/create_features_tables.sql` cria as tabelas `features` + `organization_features` e seeda a feature `database_connection`. `migrations/add_organization_database_url.sql` adiciona a coluna. Aplicar manualmente nos ambientes.
- **Required env vars:** `ANTHROPIC_API_KEY` (Claude — lido por `ChatAnthropic` automaticamente), `VOYAGEAI_API_KEY` (Voyage embeddings — lido por `VoyageEmbeddings` automaticamente), `EMBEDDING_MODEL` (set to `voyage-3-large`, 1024 dims via `outputDimension` hard-coded em `voyage-embeddings.provider.ts`), `ORCHESTRATOR_MODEL` (default `claude-sonnet-4-6`). Não há mais `ANALYTICS_ASK_API_KEY`/`BRAVOHUB_*` — auth S2S é per-org via `chat_embed_token`. **Note:** sem método de pagamento no Voyage, free tier é **3 RPM** — ingestion em volume falha com `undefined is not an object` mascarado pela `VoyageEmbeddings` que engole 429. Adicione cartão em `dash.voyageai.com/billing` para 2000 RPM (ainda no crédito grátis).

## Things that bite

- **`synchronize: true` is enabled** (`src/app.module.ts:24`). Schema is reflected from entity decorators on every boot — including against the Supabase production DB if those credentials are used. Be careful: renaming a column or changing a type on an entity will alter the live schema. Coordinate schema changes via the SQL files in `migrations/` and discuss before touching entities pointed at prod. **Note:** the pgvector migration (`create_documents_pgvector.sql`) is NOT picked up by `synchronize` — it must be applied manually via `bun run scripts/apply-pgvector-migration.ts`.
- **Three auth guards coexist; pick the right one.** There is no global guard — every handler picks per-`@UseGuards`.
  - `AuthGuard` (`src/auth/auth.guard.ts`) — JWT-only. Protects almost everything.
  - `ApiKeyGuard` (`src/auth/api-key.guard.ts`) — extracts the token from `Authorization: ApiKey <token>` and resolves it in two steps: **(1)** a real secret key from the `api_keys` table via `ApiKeyRepository.findValidByHash(sha256(token))` (not revoked, not expired) → sets `request.user` with `organization_id`, `api_key_id`, `scopes`, `role: 'service'`; **(2)** fallback to the publishable widget token via `OrganizationRepository.findActiveByEmbedToken` (matches `chat_embed_token` AND `chat_embed_enabled=true`). Secret keys are the sanctioned S2S credential (revocable + expirable); the embed token stays only for the browser widget.
  - `CompositeAuthGuard` (`src/auth/composite-auth.guard.ts`) — dispatches on the `Authorization` scheme to one of the above. Just delegates — `request.user` is now populated by whichever guard ran. When wiring a new endpoint, register both `AuthGuard` and `ApiKeyGuard` (which depends on `ApiKeyRepository` + `OrganizationRepository`) as providers in the use-case module; `CompositeAuthGuard` resolves them via DI.
- **`AuthGuard` verifies the JWT signature** via `verifyJwt` (`src/auth/auth.guard.ts`), which calls `jsonwebtoken.verify(token, process.env.JWT_SECRET)` — `JWT_SECRET` must be set and match the issuer (`GenerateTokenService`). Tampered/expired/unsigned tokens are rejected with `UnauthorizedException`. (Historical note: this guard used to base64-decode without verifying; that gap is now closed.)
- **Whitelabel auth model (multi-user + plans + API keys).** Org-scoped roles live on `users.org_role` (`owner` > `admin` > `member`), carried in the JWT and enforced by `OrgRoleGuard` + `@OrgRoles(...)` (`src/auth/org-role.guard.ts`, `src/decorators/org-roles.decorator.ts`). Plan benefits live on `PlanEntity`: `max_agents` / `max_users` (`null` = unbounded), `unlimited` (bypasses credit billing **and** quotas — used by the MAIA playground), and `monthly_credits` (granted on org creation). API keys: `api_keys` table + `ApiKeyRepository`, CRUD under `src/components/ApiKey/` (`POST /api-key/{create,list,revoke}`, owner/admin only). Member invites under `src/components/Organization/Members/` (`POST /organization/members/{invite,accept,list,role,remove}`). Seed the MAIA org + base plans with `bun run scripts/seed-maia.ts`.
- **No global API prefix.** Routes are mounted at the path declared on each `@Controller(...)` (e.g., `/support/question`), not `/api/...`. If any doc or template snippet implies `/api/...` or a global `ValidationPipe`, the code wins.
- **`.env` is checked in with live secrets** (Supabase service key, Stripe live keys, Twilio credentials, LangSmith keys). Don't echo, log, paste into messages, or commit changes that move them. If a task needs new secrets, edit `.env` locally but don't commit; surface the variable name in the PR description instead.
- **TS is loose**: `strictNullChecks: false`, `noImplicitAny: false`, `@typescript-eslint/no-explicit-any: off`. Write type-safe code anyway, but don't waste time fighting `any` in existing files unless the task is a cleanup.
- **`eslint-plugin-import` enforces order**: builtin → external → internal (`src/...`) → parent → sibling → index, alphabetized, blank line between groups. `bun run lint --fix` resolves most violations automatically.
- **`bravohub-analytics-workspace/CLAUDE.md` doesn't apply here.** Its scope rule says it only fires when `pwd` ends in `bravohub-analytics-workspace`. When `cd`'d into `split-ai/`, this file takes over.

## Commit & CI

- Conventional Commits enforced by commitlint (`build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test`). Subject in lowercase, no trailing period, blank line before body.
- Husky `pre-commit` runs `lint-staged` → ESLint + Prettier on staged files (specs excluded from ESLint).
- `.github/workflows/ci-cd.yml`: PRs run lint only. Pushes to `main` build a Docker image, push to Artifact Registry, and `gcloud run deploy split-ai` in `southamerica-east1` with `min-instances 1, max-instances 2, 4Gi, 4 CPU`. The Cloud Run service binds to `$PORT`, which is why `main.ts` reads `process.env.PORT` first.
