# Scoped rule — `src/` (scaffolding)

Thin path-scoped reminder. The canonical rules are the **Hard rules**, **Service & reasoning conventions**, and naming/import conventions in the root `CLAUDE.md`. For depth and templates, open the skills: `architecture`, `code-patterns`, `import-and-naming-conventions`.

Most-violated invariants when adding code under `src/`:

- **One use case = one module = one controller = one endpoint.** Controller handler is `handle` (or `execute`); the service's single public method is `execute`.
- **Import `RepositoriesModule` / `InfrastructureModule` as wholes** — never an individual repository or provider token at the module level.
- **Controllers** use `@Res() res: FastifyReply` + a try/catch (`res.status(error.status || 500).send(error.message)`), validate with per-handler `@Body(new ValidationPipe())`, and contain **no business logic**.
- **No global `ValidationPipe` and no global `/api` prefix** — routes mount at each `@Controller(...)` path. (The `architecture` skill's directory sketch is generic NestJS; the real scopes are `AIChat`, `ArtificialIntelligence`, `Tools`, `Organization`, `Source`, `Session`, `Credits`, `Payment`, `Whatsapp`, `OCR`, etc.)
- **New entity →** register in `RepositoriesModule`'s `forFeature([...])` **and** `src/entities/index.ts`.
- **User-facing messages in Portuguese; identifiers in English.**
