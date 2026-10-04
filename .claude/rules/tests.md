---
paths:
  - 'test/**/*.ts'
  - 'src/**/*.spec.ts'
---

# Scoped rule — tests

Thin reminder. The canonical description is the **Tests** section of the root `CLAUDE.md`.

- **Unit spec = pure function or self-contained module.** No spec mocks a repository or a Nest service; that behaviour belongs to `test/<domain>.e2e-spec.ts`. `*.spec.ts` may use `any`; nothing else may.
- **One e2e file per domain, every use case covered**: happy path, 400 with `details`, 401, 403 (permission and organization scope), 404. New endpoint → new `it(...)` blocks in the domain file, not a new file per endpoint.
- **Boot through `createTestApp()`** (`test/support/test-app.ts`) and reset with `t.reset()` in `beforeEach`; build data with `test/support/factories.ts` and tokens with `bearer(user)`. Specs run serially (`--runInBand`) against one database prepared by `test/global-setup.ts`.
- **Integrations are the mocks** (`INTEGRATION_MODE=mock`): assert on their observable effects (rows written, NDJSON events, `received: true`), never on real upstreams. A Stripe webhook test posts the raw event JSON with any `stripe-signature` header.
- **Database comes from `TEST_DATABASE_URL`** (CI service container, `docker compose up postgres`, or Testcontainers when Docker exists). The schema is synchronized from the entities, not migrated (PC-017).
