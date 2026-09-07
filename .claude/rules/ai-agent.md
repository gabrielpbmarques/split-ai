---
paths:
  - 'src/components/ArtificialIntelligence/**/*.ts'
  - 'src/types/models/ai-instructions.model.ts'
---

# Scoped rule — `src/components/ArtificialIntelligence/`

Thin path-scoped reminder. Full detail: **`ai-agent-configuration`** (CRUD, prompts, tables) and **`ai-agent-runtime`** (ResolveAgent, GenerateAIResponse, memory, tracing). For RAG/tools see **`ai-agent-tools-and-rag`**.

Must-not-break invariants:

- **`synchronize: true` is on** — editing `agent.entity.ts` / `agent-instruction.entity.ts` alters the live Supabase schema on boot. Coordinate via `migrations/` SQL; don't rename columns/types casually.
- **`AIInstructions` keys are literal.** `NormalizePromptInstructions` reads `instructions.objetivo` / `instructions.context` / `instructions.diretrizes` by name (type at `src/types/models/ai-instructions.model.ts`). Renaming a key (e.g. `objetivo → objective`) silently renders the OBJ/CTX/DIR prompt section as `undefined` — see the `contexto`/`context` bug below.
- **Dual-key agent lookup:** `ResolveAgent` and `UpdateAgent` accept either the UUID **or** the `agent_identifier` in the same field. Preserve the regex-then-fallback pattern.
- **`thread_id` is `` `${organization_id}_${session_id}` ``** — this binds a conversation to its checkpointer history. Changing the format detaches existing sessions from memory.
- **The checkpointer is one shared static `PostgresSaver` per process**, on the **same** Supabase Postgres as TypeORM (its tables live alongside entities — don't drop/rename them). Created only when `agent.with_history === true`.
- **Retrieval under this scope is candidates → rerank → threshold.** `ExecuteSimilaritySearch` no longer embeds by hand or uses `topK`; it builds a `ContextualCompressionRetriever` (from **`@langchain/classic`**, not `langchain`) over `asRetriever({ k })` plus the `RerankDocuments` compressor. Two things break the build or the query if touched: never pass `filter` to `asRetriever` (the store already fixes `this.filter`, and both together throw), and keep the `as unknown as BaseRetrieverInterface` cast — it works around a `NodeNext` typings clash in `@langchain/community`, not a real mismatch.
- **`GenerateAIResponse` swallows all errors** into a pt-BR string ("Desculpe, tive um problema…"). Callers never see stack traces — observe via LangSmith/Sentry. LangSmith tracing is **always on** (`LANGSMITH_*` env vars required in every env).
- **The `GenerateAIResponse` stream loop has two load-bearing extractions:** `usage_metadata` → `RecordTokenUsage` (only when `agent.organization_id` is set) and `structuredResponse.finalAnswer` → the streamed `final` event. Other updates become `status`/`error`/`done` events. When adding streamed output, add a new branch — never break those two, or the reply/token-accounting silently stops (no error).
- **`organization_id = null` means a legacy global/admin agent** — token usage isn't recorded for them, and admin-scoped reads (`ListAgents` for `role==='admin'`) still surface them. **`CreateAgent` no longer creates null agents** (it always scopes to `user.organization_id` and enforces the plan's `max_agents` quota); only the platform-admin `CreateAttendantAgent` path can still produce a null/global agent via an explicit `dto.organizationId`. Don't reintroduce the `role === 'admin' ? null : org_id` shortcut in `CreateAgent`.
- **Known bug to not propagate:** `CreateAttendantAgent` stores `contexto` (pt) but `NormalizePromptInstructions` reads `context` (en). Standardize on `context` (the type) if you touch it. Live runtime is `ChatAnthropic` (see `langchain-anthropic-integration`); verify the live code, don't copy stale `ChatVertexAI`/Gemini snippets from the skill bodies.
- **`UpdateAgent` is the sanctioned multi-endpoint exception** to "one controller = one endpoint" (`GET /agent`, `GET /agent/:id`, `PATCH /agent/:id`). Don't replicate the pattern elsewhere; don't merge it with the org-scoped `GET /agent/list`.
