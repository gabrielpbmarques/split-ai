---
trigger: always_on
---

# Tests

Owns: the two test layers, the e2e harness and what a test may and may not do. The runner is **Jest** (`ts-jest`), a conscious deviation from the rule set's Vitest.

## Two layers

<rules>
- **Unit spec** (`src/**/*.spec.ts`, next to the file) only for pure functions and self-contained modules: mappers, `sql-guard`, `http-client`, `permissions`, `TokenVerifier`, `VoyageRerankCompressor`, utils, plus the two Nest-module specs `auth-layer.spec.ts` and `http-layer.spec.ts`. `*.spec.ts` may use `any`; nothing else may.
- **E2e spec**: one file per domain, `test/<domain>.e2e-spec.ts`. A service spec that mocks a repository or a Nest service is not added; that behavior belongs in the domain's e2e file.
- Every use case is covered: happy path, 400 with `details`, 401, 403 (missing permission) and 404. A new endpoint adds `it(...)` blocks to the domain file, not a new file.
</rules>

## Harness

<rules>
- Boot through `createTestApp()` (`test/support/test-app.ts`): the real `AppModule` on Fastify with the same adapter factory and `ValidationPipe` as `main.ts`. Never assemble a separate app for tests.
- Reset with `t.reset()` in `beforeEach` (truncates every table); build data with `test/support/factories.ts` and tokens with `bearer(user)`.
- Specs run serially (`--runInBand`) against one database prepared by `test/global-setup.ts`.
- Database from `TEST_DATABASE_URL` (CI service container `postgres:16-alpine`, or `docker compose up postgres` locally), falling back to Testcontainers when Docker exists. The schema is synchronized from the entities and the migrations are marked applied (PC-017).
- The environment is hermetic (`test/setup-env.ts`): it points `DOTENV_CONFIG_PATH` away from `.env`, forces `INTEGRATION_MODE=mock`, disables LangSmith tracing and pins deterministic values such as `JWT_SECRET`. A spec that depends on an env value asserts the pinned value; never rely on the developer's shell or `.env`.
- Integrations are the mocks: assert on their observable effects (rows written, NDJSON events, `received: true`), never on real upstreams.
</rules>

## What a good test looks like

<rules>
- The test name describes behavior, not the method called. Test intent goes in the `it(...)` text (comments are a lint error).
- Cover error paths and rule edges, not only the happy path.
- Tests do not depend on execution order.
- Do not test the framework's dependency injection; `di:verify` and `di:boot-check` do that.
- When a test starts failing after a change, fix the code. If the test itself is wrong, tell the requester before changing it. Never delete, skip or weaken a test to make it pass.
- The solution serves every valid input, not only the test's. No value hard-coded to satisfy a test case.
</rules>
