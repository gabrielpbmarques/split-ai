---
paths:
  - 'src/modules/retrieval/**/*.ts'
  - 'src/shared/utils/build-zod-schema.ts'
  - 'src/infrastructure/integration/customer-database/**'
---

# Agent tools and SQL guardrails — `src/modules/retrieval/`

Thin path-scoped reminder. Full detail: the **`ai-agent-tools-and-rag`** skill. This scope holds the generic agent tools (`load-vector-search-tool`, `load-database-tool`), the tool-belt assembly (`load-agent-tools`) and the retrieval pipeline (`execute-similarity-search`, `rerank-documents`).

<rules>
- **One tool = one use-case module = one service.** Each tool lives in its own `<verb>-<noun>/` folder with a single `@Injectable()` whose `execute(...)` returns an `AgentTool`. Never bundle several tools into one service; copy `load-vector-search-tool` / `load-database-tool` as the template.
- **The parser tool's `func` stays inert.** `buildLangchainToolFromSchema` (`src/shared/utils/build-zod-schema.ts`) returns `tool(async () => {}, …)`: its only job is to let the model emit a schema-shaped argument. Call sites assume parser tools have no side effects.
- **`vector_similarity_search` is threshold-based, not top-K.** The dense search only produces candidates (`VECTOR_SEARCH_CANDIDATE_K`, default 50); the Voyage `rerank-2.5` cross-encoder keeps those with `relevance_score >= VECTOR_SEARCH_MIN_SCORE` (default 0.8), capped at `VECTOR_SEARCH_MAX_RESULTS`. An empty result is a designed outcome. Before "fixing" missing context, read the `VoyageRerankCompressor` warning (it logs the best score) and consider lowering the threshold. Never move the cutoff onto the cosine score: `match_documents` already orders by it, so it carries no extra signal.
- **`vector_similarity_search` is bound to its agent.** `LoadVectorSearchToolService.execute(agentId)` closes over the resolved agent's UUID and filters `loadIndex({ agent_id: agentId })` — by agent only, never by `source_type`, so files ingested without a type and sites are found. Never put `agent_id` back in the tool schema or a prompt placeholder: the model would choose it, and it can pick another agent's sources.
- **Tool descriptions are Portuguese and product-agnostic.** They are rendered into the system prompt, so wording changes model behavior (the "always call vector search first" line, the SQL "REGRAS DE OURO").
</rules>

## `execute_sql`

The tool is opt-in **per agent**. `MaybeLoadDatabaseToolService` adds it only when `agents.database_tool = true` **and** `agents.database_url` is set. `database_url` is `select: false` on the entity and is read only through `AgentRepository.findDatabaseConnection(id)`, together with the optional allow-list `database_tables` and `database_sample_rows`. A missing prerequisite means the LLM never sees the tool — check these columns before debugging a "tool ignored" report.

<rules>
- Keep every guardrail in `sanitizeSqlQuery` (`integration/customer-database/sql-guard.ts`, pure, with spec): single statement; first-verb allow-list (`select`/`insert`/`update`, only `select` in read-only mode); deny regex `\b(DELETE|ALTER|DROP|CREATE|REPLACE|TRUNCATE)\b` even after an allowed verb; ` LIMIT 5` appended when no `LIMIT` is present.
- Dialect comes from the URL prefix (`postgres`/`postgresql` → PostgreSQL, `mysql`/`mysql2` → MySQL); anything else is rejected. The DTOs validate the same prefixes.
- Connections go through the `CUSTOMER_DATABASE` port (host allowlist, timeouts); never open a `DataSource` from this scope.
- `database_url` is a secret: never log it or return it from an endpoint.
</rules>
