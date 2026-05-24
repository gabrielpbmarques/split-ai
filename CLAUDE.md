# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About this project

`split-ai` is a **third project** living inside `bravohub-analytics-workspace/`, alongside `bravohub-analytics` and `bravohub-analytic-frontend`. The workspace `CLAUDE.md` one level up does **not** mention it — that file only describes the other two. Treat this file as authoritative when working under `split-ai/`.

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

## Per-org database connection feature

Single, opt-in mechanism for an agent to query its organization's own database. Replaces the older BravoHub-specific tool belt and the `organization_analytics_config` table. No HTTP gateway in the middle — the tool builds a TypeORM `DataSource` per request against the customer's DB directly.

- **Endpoint:** `POST /support/question` (`src/components/AIChat/Question/`) is the single entry point for all chat. It streams NDJSON via Fastify response hijacking (`application/x-ndjson`). Guarded by **`CompositeAuthGuard`** (`src/auth/composite-auth.guard.ts`), which dispatches on the `Authorization` scheme:
  - `Authorization: Bearer <jwt>` → `AuthGuard` (user-facing browser/app traffic; `request.user` is the JWT payload, including `organization_id`).
  - `Authorization: ApiKey <chat_embed_token>` → `ApiKeyGuard` (server-to-server). The guard looks up the org by `chat_embed_token` **and** `chat_embed_enabled=true` (`OrganizationRepository.findActiveByEmbedToken`) and populates `request.user` with the resolved `organization_id` plus `role: 'service'`. The `role === 'service'` carve-out in `QuestionService` keeps S2S calls **out of credit billing** while still associating them with the right org.
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
  - `ApiKeyGuard` (`src/auth/api-key.guard.ts`) — extracts the token from `Authorization: ApiKey <token>`, looks up the org via `OrganizationRepository.findActiveByEmbedToken` (matches `chat_embed_token` AND `chat_embed_enabled=true`), and populates `request.user` with the resolved `organization_id` + `role: 'service'`. Per-org keys, no global secret.
  - `CompositeAuthGuard` (`src/auth/composite-auth.guard.ts`) — dispatches on the `Authorization` scheme to one of the above. Just delegates — `request.user` is now populated by whichever guard ran. When wiring a new endpoint, register both `AuthGuard` and `ApiKeyGuard` (which depends on `OrganizationRepository`) as providers in the use-case module; `CompositeAuthGuard` resolves them via DI.
- **`AuthGuard` does NOT verify the JWT signature.** `parseJwt` in `src/auth/auth.guard.ts:85` just base64-decodes the payload. Any well-formed JWT is accepted. This is a real security gap — flag it if the task touches auth, but don't silently "fix" it without confirming, since downstream services may depend on the current behavior. `JWT_SECRET` and `JWT_EXPIRATION` env vars exist but aren't used by this guard. (`ApiKeyGuard` is the one place where credentials are actually checked, by exact-match lookup against `chat_embed_token`.)
- **No global API prefix.** Routes are mounted at the path declared on each `@Controller(...)` (e.g., `/support/question`), not `/api/...`. The `main-instructions` skill says otherwise — the code wins.
- **`.env` is checked in with live secrets** (Supabase service key, Stripe live keys, Twilio credentials, LangSmith keys). Don't echo, log, paste into messages, or commit changes that move them. If a task needs new secrets, edit `.env` locally but don't commit; surface the variable name in the PR description instead.
- **TS is loose**: `strictNullChecks: false`, `noImplicitAny: false`, `@typescript-eslint/no-explicit-any: off`. Write type-safe code anyway, but don't waste time fighting `any` in existing files unless the task is a cleanup.
- **`eslint-plugin-import` enforces order**: builtin → external → internal (`src/...`) → parent → sibling → index, alphabetized, blank line between groups. `bun run lint --fix` resolves most violations automatically.
- **`bravohub-analytics-workspace/CLAUDE.md` doesn't apply here.** Its scope rule says it only fires when `pwd` ends in `bravohub-analytics-workspace`. When `cd`'d into `split-ai/`, this file takes over.

## Commit & CI

- Conventional Commits enforced by commitlint (`build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test`). Subject in lowercase, no trailing period, blank line before body.
- Husky `pre-commit` runs `lint-staged` → ESLint + Prettier on staged files (specs excluded from ESLint).
- `.github/workflows/ci-cd.yml`: PRs run lint only. Pushes to `main` build a Docker image, push to Artifact Registry, and `gcloud run deploy split-ai` in `southamerica-east1` with `min-instances 1, max-instances 2, 4Gi, 4 CPU`. The Cloud Run service binds to `$PORT`, which is why `main.ts` reads `process.env.PORT` first.
