# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About this project

`split-ai` is a **third project** living inside `bravohub-analytics-workspace/`, alongside `bravohub-analytics` and `bravohub-analytic-frontend`. The workspace `CLAUDE.md` one level up does **not** mention it — that file only describes the other two. Treat this file as authoritative when working under `split-ai/`.

It's a NestJS 10 + Fastify backend for an AI assistant product (chat, OCR, source ingestion, voice, WhatsApp, billing). The AI pipeline is built on LangChain / LangGraph with Google Vertex AI and OpenAI models, vector storage in Supabase/pgvector, and PostgreSQL (also hosted on Supabase) as the primary store via TypeORM. It is independent of the BravoHub products — no shared database, no shared auth contract.

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

`.claude/skills/` contains eleven SKILL.md files that auto-load when working here. They split into two groups:

**General (read before scaffolding new code):**

- `main-instructions` — quick stack reference
- `architecture` — module hierarchy, scope/use-case pattern, repository/provider patterns
- `code-patterns` — controller/service/DTO templates, error handling, parallel async
- `import-and-naming-conventions` — paths, suffixes, casing, commit format
- `tech-stack` — every external integration, token, and env var
- `thinking-flow` — how to approach problems before coding

**AI pipeline (most engineering work here lives in this stack — LangChain/LangGraph + Vertex AI + Supabase pgvector):**

- `agent-end-to-end-flow` — the cross-cutting map: `POST /agent/create` and source ingestion → `POST /support/question` / `/chat/attendant` → `ResolveAgent` → `GenerateAIResponse` → LangGraph runnable → tools → pgvector → persistence/billing. **Start here for any change that crosses the AI areas below.**
- `ai-agent-configuration` — agent CRUD, `AIInstructions`, prompt construction, parser schemas, `agents` / `agents_instructions` tables
- `ai-agent-runtime` — `ResolveAgent`, `GenerateAIResponse`, LangGraph streaming, structured responses, `thread_id` memory via `PostgresSaver`, LangSmith tracing
- `ai-agent-tools-and-rag` — LangChain tools (`vector_similarity_search`, `execute_sql` with guardrails, parser), pgvector behavior, Spider ingestion, embeddings via Vertex AI
- `ai-chat-flows` — `src/components/AIChat/`, the `/support/question` SSE-like streaming endpoint, `/chat/attendant`, Fastify response hijacking, session/credit/message persistence

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
  infrastructure/providers/  External SDK wrappers (Vertex AI, GCS, Twilio, SendGrid, Stripe,
                             Supabase, Spider, Google TTS)
  components/                Feature modules — PascalCase Scope/ → PascalCase UseCase/ → kebab-case files
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

## Things that bite

- **`synchronize: true` is enabled** (`src/app.module.ts:24`). Schema is reflected from entity decorators on every boot — including against the Supabase production DB if those credentials are used. Be careful: renaming a column or changing a type on an entity will alter the live schema. Coordinate schema changes via the SQL files in `migrations/` and discuss before touching entities pointed at prod.
- **`AuthGuard` does NOT verify the JWT signature.** `parseJwt` in `src/auth/auth.guard.ts:85` just base64-decodes the payload. Any well-formed JWT is accepted. This is a real security gap — flag it if the task touches auth, but don't silently "fix" it without confirming, since downstream services may depend on the current behavior. `JWT_SECRET` and `JWT_EXPIRATION` env vars exist but aren't used by this guard.
- **No global API prefix.** Routes are mounted at the path declared on each `@Controller(...)` (e.g., `/support/question`), not `/api/...`. The `main-instructions` skill says otherwise — the code wins.
- **`.env` is checked in with live secrets** (Supabase service key, Stripe live keys, Twilio credentials, LangSmith keys). Don't echo, log, paste into messages, or commit changes that move them. If a task needs new secrets, edit `.env` locally but don't commit; surface the variable name in the PR description instead.
- **TS is loose**: `strictNullChecks: false`, `noImplicitAny: false`, `@typescript-eslint/no-explicit-any: off`. Write type-safe code anyway, but don't waste time fighting `any` in existing files unless the task is a cleanup.
- **`eslint-plugin-import` enforces order**: builtin → external → internal (`src/...`) → parent → sibling → index, alphabetized, blank line between groups. `bun run lint --fix` resolves most violations automatically.
- **`bravohub-analytics-workspace/CLAUDE.md` doesn't apply here.** Its scope rule says it only fires when `pwd` ends in `bravohub-analytics-workspace`. When `cd`'d into `split-ai/`, this file takes over.

## Commit & CI

- Conventional Commits enforced by commitlint (`build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test`). Subject in lowercase, no trailing period, blank line before body.
- Husky `pre-commit` runs `lint-staged` → ESLint + Prettier on staged files (specs excluded from ESLint).
- `.github/workflows/ci-cd.yml`: PRs run lint only. Pushes to `main` build a Docker image, push to Artifact Registry, and `gcloud run deploy split-ai` in `southamerica-east1` with `min-instances 1, max-instances 2, 4Gi, 4 CPU`. The Cloud Run service binds to `$PORT`, which is why `main.ts` reads `process.env.PORT` first.
