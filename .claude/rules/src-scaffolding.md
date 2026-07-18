---
paths:
  - 'src/**/*.ts'
---

# Scoped rule — `src/` (scaffolding)

Thin path-scoped reminder. The canonical rules are the **Hard rules**, **Service & reasoning conventions**, and naming/import conventions in the root `CLAUDE.md`. For depth and templates, open the skills: `architecture`, `code-patterns`, `import-and-naming-conventions`.

Most-violated invariants when adding code under `src/`:

- **One use case = one module = one controller = one endpoint.** Controller handler is `handle` (or `execute`); the service's single public method is `execute`.
- **Wire the scope-module chain, or the endpoint 404s silently.** A new use-case module must be imported **and** re-exported in its scope module, and the scope module imported **and** re-exported in `ComponentsModule`. A module that compiles but isn't chained never registers its route — no error, just a missing endpoint.
- **Import `RepositoriesModule` / `InfrastructureModule` as wholes** — never an individual repository or provider token at the module level.
- **In services, import a repository from its own file** (`src/repositories/<name>.repository`), never from the barrel `src/repositories/index.ts` — the barrel is for module wiring and risks circular imports.
- **Controllers** use `@Res() res: FastifyReply` + a try/catch (`res.status(error.status || 500).send(error.message)`), validate with per-handler `@Body(new ValidationPipe())`, and contain **no business logic**.
- **Query-param DTOs use `@Query(new ValidationPipe({ transform: true }))`** (not the bare `@Body` form) so `class-transformer` coerces types — pair with `@Type(() => Number)` on numeric fields, or the params stay strings.
- **No global `ValidationPipe` and no global `/api` prefix** — routes mount at each `@Controller(...)` path. (The `architecture` skill's directory sketch is generic NestJS; the real scopes are `AIChat`, `ArtificialIntelligence`, `Tools`, `Organization`, `Source`, `Session`, `Credits`, `Payment`, `Whatsapp`, `OCR`, etc.)
- **New entity →** register in `RepositoriesModule`'s `forFeature([...])` **and** `src/entities/index.ts`.
- **User-facing messages in Portuguese; identifiers in English.**
