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
bun run test                                # jest (unit)
bun run test:e2e                            # jest with test/jest-e2e.json
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
  - `.claude/rules/rag-ingestion.md` (`Source/`, `OCR/`, `LoadAgentSites/`, `supabase.provider.ts`) — ingestion metadata contract: chunks must carry `agent_id` + `source_id` (→ `ai-agent-tools-and-rag`).
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
- `eleven-labs` — ElevenLabs API reference (TTS, voice cloning, STT, sound effects, voice changer, conversational AI). Knowledge base for building **ElevenLabs-specific** voice features. **Provider is wired but unused**: `eleven-labs.provider.ts` exposes `ELEVEN_LABS_SERVICE` (`textToSpeech` returns MP3 `Uint8Array`, a drop-in for the Google seam; plus `textToSpeechStream` / `speechToText`) via `@elevenlabs/elevenlabs-js`. No endpoint consumes it yet — the **active** voice path is still Google TTS (`ConvertTextToSpeech` + `google-voice.provider.ts`). Config lives in `src/shared/config/env.ts` (`ELEVENLABS_*`).

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
    <resource>/              One folder per external SDK (stripe, twilio, sendgrid, supabase, spider, anthropic,
                             voyage-embeddings, voyage-rerank, gcp-storage, google-voice, eleven-labs):
                             <resource>.tokens.ts (Symbol tokens), <resource>.provider.ts, <resource>.provider.module.ts
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

1. A module's `imports` array lists **exactly** the modules that supply what its own providers/controllers/guards inject — nothing more. One repository → `XRepositoryModule` (`src/modules/users/repositories/<name>.repository.module.ts`); one infra token → `XProviderModule` (`src/infrastructure/voyage-rerank/<name>.provider.module.ts`); one sibling service → that use case's own module. **Never** import a domain aggregator (`AgentsModule`, `SessionsModule`, …) to reach one service inside it, and never import a module "just in case". Infra tokens are `Symbol`s in `src/infrastructure/<name>/<name>.tokens.ts`. **No `forwardRef`**: a dependency that would close a cycle goes through a port in `modules/<domain>/contracts/` (see `AGENT_RESOLVER`).
2. One use case = one module = one controller = one endpoint. Controller handler is `handle` or `execute`; service public method is `execute`.
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

1. **Push work to the database/repository.** Don't fetch full rows and discard fields in TS — add an optional `select` (or a dedicated query) so the repository returns exactly what's needed. Prefer one optimized query over in-service transformation.
2. **Type every public method's return explicitly.** Each `execute()` declares its return type; for a strict subset of an entity, define a `Pick<>` type in `src/shared/contracts/models/` and barrel-export it.
3. **Skip checks the call chain already guarantees.** The global guards guarantee `user` on every non-public route; `@Body(new ValidationPipe())` guarantees required DTO fields; a prior `NotFoundException` guarantees the entity exists. Don't re-check them.
4. **Early return; keep the happy path flat.** Validate and throw `NestJS` exceptions at the top, then proceed. Don't catch in services or controllers — let exceptions bubble to `GlobalExceptionFilter`.
5. **Parallelize independent async work.** `Promise.all` when all must succeed; `Promise.allSettled` for fire-and-forget side effects.

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
- **`LoadDatabaseTool`** (`src/modules/retrieval/load-database-tool/`) detecta o dialeto pelo prefixo da URL (`postgres://`/`postgresql://` → Postgres; `mysql://`/`mysql2://` → MySQL). Constrói o `DataSource` lazy via TypeORM por chamada. Sanitização: statement única; allow-list do primeiro verbo (`SELECT`/`INSERT`/`UPDATE`; em modo read-only apenas `SELECT`); deny regex `DELETE|ALTER|DROP|CREATE|REPLACE|TRUNCATE` mesmo após verbo permitido; força `LIMIT 5` quando não há LIMIT. Agentes BravoHub-scoped (`env.BRAVOHUB_SCOPED_AGENTS`) rodam company-scoped read-only via `scopeCompanyId`.
- **Knowledge externo (schema do banco do cliente, docs internos):** ingerir como `Source` do agente (via `/agent/load-sites`, OCR ou outras rotas de Source). `LoadVectorSearchTool` (já existente) filtra por `agent_id` na busca semântica.
- **A tabela `documents` e a função `match_documents` vivem só no Supabase.** O diretório `migrations/` foi removido no commit `cfa5375` e `scripts/apply-pgvector-migration.ts` não existe mais — não há nenhum `.sql` versionado no repo. A assinatura em uso é a padrão do LangChain, `match_documents(query_embedding vector, match_count int, filter jsonb)`, retornando `(id, content, metadata, similarity)` com `similarity = 1 - (embedding <=> query_embedding)` (maior = melhor). `synchronize` do TypeORM não toca nisso: não cria a extensão `vector`, o índice cosine nem a função. Qualquer mudança de schema vetorial é aplicada à mão no SQL editor do Supabase.
- **Features migrations:** as tabelas `features` + `organization_features` (com a feature `database_connection` seedada) e a coluna `organizations.database_url` também foram criadas por SQL aplicado à mão. Os arquivos citados por versões antigas deste documento (`migrations/create_features_tables.sql`, `migrations/add_organization_database_url.sql`) **não existem mais no repo** — o estado real está no Supabase.
- **Required env vars:** `ANTHROPIC_API_KEY` (Claude — lido por `ChatAnthropic` automaticamente), `VOYAGEAI_API_KEY` (usada pelos **dois** providers Voyage: lida do env pelo `VoyageEmbeddings` e via `env.VOYAGEAI_API_KEY` pelo reranker), `EMBEDDING_MODEL` (set to `voyage-3-large`, 1024 dims via `outputDimension` hard-coded em `voyage-embeddings.provider.ts`), `ORCHESTRATOR_MODEL` (default `claude-sonnet-4-6`). Opcionais de retrieval, todos com default em `src/shared/config/env.ts`: `RERANK_MODEL` (`rerank-2.5`), `VECTOR_SEARCH_CANDIDATE_K` (`50`), `VECTOR_SEARCH_MIN_SCORE` (`0.8`), `VECTOR_SEARCH_MAX_RESULTS` (`10`). Não há mais `ANALYTICS_ASK_API_KEY`/`BRAVOHUB_*` — auth S2S é per-org via `chat_embed_token`.

## Things that bite

- **`synchronize: true` is enabled** (`src/app.module.ts:24`). Schema is reflected from entity decorators on every boot — including against the Supabase production DB if those credentials are used. Be careful: renaming a column or changing a type on an entity will alter the live schema. Coordinate schema changes by hand in the Supabase SQL editor and discuss before touching entities pointed at prod. **Note:** there is no `migrations/` directory any more (deleted in `cfa5375`) and no `.sql` file anywhere in the repo — the `documents` table, the `match_documents` function and the pgvector index live only in the Supabase project and are invisible to `synchronize`.
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
- **TS is loose**: `strictNullChecks: false`, `noImplicitAny: false`, `@typescript-eslint/no-explicit-any: off`. Write type-safe code anyway, but don't waste time fighting `any` in existing files unless the task is a cleanup.
- **`eslint-plugin-import` enforces order**: builtin → external → internal (`src/...`) → parent → sibling → index, alphabetized, blank line between groups. `bun run lint:fix` resolves most violations automatically. Also enforced as errors: `no-console` (use Nest `Logger`), kebab-case file and folder names under `src/`, and no relative imports (`./`, `../`) outside `infrastructure/database/schema/`. In `warn` for now: no inline comments, no `TODO`/`FIXME`.
- **`bravohub-analytics-workspace/CLAUDE.md` doesn't apply here.** Its scope rule says it only fires when `pwd` ends in `bravohub-analytics-workspace`. When `cd`'d into `split-ai/`, this file takes over.

## Commit & CI

- Conventional Commits enforced by commitlint (`build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test`). Subject in lowercase, no trailing period, blank line before body.
- Husky `pre-commit` runs `lint-staged` → ESLint + Prettier on staged files (specs excluded from ESLint).
- `.github/workflows/ci-cd.yml`: PRs run `format:check`, `lint`, `typecheck`, `test` and `build`. Pushes to `main` build a Docker image, push to Artifact Registry, and `gcloud run deploy split-ai` in `southamerica-east1` with `min-instances 1, max-instances 2, 4Gi, 4 CPU`. The Cloud Run service binds to `$PORT`, which is why `env.PORT` has no hard-coded production value.
