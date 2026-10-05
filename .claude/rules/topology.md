---
paths:
  - 'src/main.ts'
  - 'src/app.module.ts'
  - 'src/shared/config/**'
  - '.env.example'
  - 'package.json'
  - 'tsconfig*.json'
  - 'nest-cli.json'
  - 'eslint.config.mjs'
---

# Project topology, bootstrap and tooling

Owns: where code lives, the boot sequence, environment configuration, import paths, tooling and the pre-completion checklist. The full `src/` tree is in `CLAUDE.md` ("Architecture in one screen"); this file holds the rules behind it.

## Layout rules

<rules>
- `src/shared/` is application-wide and never touches an external resource (database, queue, third-party API). If it needs one, it belongs in `src/infrastructure/`.
- `src/infrastructure/` has one subfolder per external dependency (`database/`, `integration/`), never per file kind (`services/`, `helpers/`).
- `src/modules/<domain>/` holds business domains. A domain never imports another domain's internal file; see `conventions.md` for the allowed crossings.
- `src/auth/` holds the global guards, `TokenVerifier`, `PrincipalResolverService` and the permission catalog.
- Unit specs (`*.spec.ts`) sit next to the file they test; e2e specs live in `test/`.
</rules>

## `main.ts` boot order

The order is fixed because each step depends on the previous one (correlation must exist before the logger reads it; the pipe must exist before any route runs).

<rules>
1. `import 'dotenv/config'` is the first line.
2. Build the app with `createFastifyAdapter()` from `src/shared/http/fastify-adapter.ts`. Tests use the same factory; never assemble a separate adapter for tests.
3. HTTP hardening lives in the adapter factory: helmet with its default CSP and frameguard (a route that needs inline scripts or framing gets a scoped exception, never a global switch-off), multipart, `x-request-id` correlation hook.
4. `AppLoggerModule` (pino) is the logger.
5. CORS from `env.ALLOWED_ORIGINS` (empty reflects any origin; `*` is rejected by the schema).
6. `app.useGlobalPipes(createValidationPipe())`.
7. `app.enableShutdownHooks()`.
8. Swagger at `/docs` only when `env.SWAGGER_ENABLED` and not in production.
9. `app.listen({ port: env.PORT, host: '0.0.0.0' })`.
</rules>

There is no `app.setGlobalPrefix(...)`: routes mount at each `@Controller()` path because Cloud Run health checks and existing clients depend on the current paths.

<critical_rule>
A route registered directly on the Fastify instance (Swagger UI, static files, a Fastify plugin) bypasses the Nest guards. Whoever registers it protects it in the registration itself (an `onRequest` hook, or disabling it outside development). See `docs/problemas-conhecidos.md` for related entries.
</critical_rule>

## `app.module.ts`

<rules>
- `APP_FILTER` (`GlobalExceptionFilter`) is registered in `AppModule`; `APP_GUARD`s are registered inside `AuthModule`.
- `AppModule` imports only infrastructure modules and domain aggregators, never a use-case module.
- A domain with no implemented use case is not imported.
- `TypeOrmModule.forRootAsync` uses the explicit `ENTITIES` and `MIGRATIONS` arrays, `synchronize: false`, `migrationsRun: false`.
- `DevtoolsModule` is skipped when `env.isTest` (PC-018).
</rules>

## Environment configuration

<rules>
- `src/shared/config/env.ts` is the only file that reads `process.env`. Everything else imports the frozen object: `import { env } from 'src/shared/config/env'`. `@nestjs/config` is not used.
- The Zod schema is the source of truth. An invalid environment aborts the boot listing every problem at once.
- Derived values (`isProduction`, `isTest`, `INTEGRATION_MODE` default) are computed once in `loadConfig()`.
- A new variable goes into the schema **and** `.env.example` in the same change, before the code that reads it.
- Missing integration credentials never abort the boot; the gateway reports `NOT_CONFIGURED` instead (see `integrations.md`). Only `DATABASE_URL` and `JWT_SECRET` are boot-critical.
- Never paste secret values into code, commits or messages.
</rules>

## Imports

<rules>
- The single path alias is `src/*`. Every internal import is absolute from `src/`, including between sibling files: `import { CreateAgentDto } from 'src/modules/agents/create-agent/create-agent.dto';`.
- Exception: files inside `src/infrastructure/database/schema/` import each other relatively.
- `import/order` groups builtin → external → `src/…`, alphabetized, with a blank line between groups; `bun run lint:fix` sorts them.
</rules>

## Tooling

<rules>
- Package manager is **bun** (`bun.lock`, Dockerfile, CI). Scripts call `nest`/`jest` directly.
- Files and folders are kebab-case (lint: `check-file`).
- Comments under `src/` fail `bun run lint` (`scripts/lint/no-comments.ts`). `console.*` and `any` (outside specs) are lint errors.
- `tsconfig.build.json` disables `incremental` so `nest build` always emits the whole `dist/`.
- TypeORM CLI scripts (`db:*`, `test:db:prepare`) run under ts-node/CommonJS, never bun's ESM loader (PC-006).
- Do not upgrade `typeorm`, `@nestjs/*`, `typescript` or the `@langchain/*` family without an explicit request: several PC entries are pinned to their exact versions.
</rules>

## Verification before finishing a task

<checklist>
```bash
bun run format:check
bun run lint            # clean, without --fix and without eslint-disable
bun run typecheck
bun run test
bun run test:e2e        # when a route, the database or tokens were touched (needs TEST_DATABASE_URL or Docker)
bun run build
bun run di:verify && bun run di:boot-check   # when module wiring changed
```

If an entity changed: generate the migration (`database.md`), review it and commit it with the entity.
</checklist>
