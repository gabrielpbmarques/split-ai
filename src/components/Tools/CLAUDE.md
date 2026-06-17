# Scoped rule — `src/components/Tools/`

Thin path-scoped reminder. Full detail: the **`ai-agent-tools-and-rag`** skill. This scope holds only generic, tenant-agnostic agent tools (`LoadVectorSearchTool`, `LoadDatabaseTool`).

Must-not-break invariants:

- **One tool = one module = one service.** Each tool gets its own directory under `Tools/` with a single `@Injectable()` service exposing `execute(ctx): DynamicStructuredTool<...>`. Never bundle multiple tools into one service; never place tool modules outside this scope. Copy `LoadVectorSearchTool` / `LoadDatabaseTool` as the template.
- **Tool descriptions are pt-BR and tenant-agnostic** — no product- or org-specific copy. They are also rendered into the system prompt, so wording changes the model's behavior (e.g. the "always call vector search first" line, the SQL "REGRAS DE OURO").
- **`LoadDatabaseTool` SQL guardrails (`sanitizeSqlQuery`) — keep all of them:** single statement only; verb allow-list `select`/`insert`/`update`; deny regex `\b(DELETE|ALTER|DROP|CREATE|REPLACE|TRUNCATE)\b` even after an allowed verb; append ` LIMIT 5` when no `LIMIT` is present. Dialect detected from the URL prefix (`postgres`/`postgresql` → Postgres, `mysql`/`mysql2` → MySQL); others → `BadRequestException`. Targets the **customer's own DB** per request — there is no tenant filter anymore.
- **`database_tool` is feature-gated.** `ResolveAgent` injects it only when `agents.database_tool=true` **and** `organization_id` set **and** `organization_features.database_connection` enabled **and** `organizations.database_url` populated. Any missing prerequisite → the tool is silently absent (the LLM never sees it). Check these before debugging a "tool ignored" report.
