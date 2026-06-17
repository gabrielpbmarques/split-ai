# Scoped rule — `src/components/ArtificialIntelligence/`

Thin path-scoped reminder. Full detail: **`ai-agent-configuration`** (CRUD, prompts, tables) and **`ai-agent-runtime`** (ResolveAgent, GenerateAIResponse, memory, tracing). For RAG/tools see **`ai-agent-tools-and-rag`**.

Must-not-break invariants:

- **`synchronize: true` is on** — editing `agent.entity.ts` / `agent-instruction.entity.ts` alters the live Supabase schema on boot. Coordinate via `migrations/` SQL; don't rename columns/types casually.
- **Dual-key agent lookup:** `ResolveAgent` and `UpdateAgent` accept either the UUID **or** the `agent_identifier` in the same field. Preserve the regex-then-fallback pattern.
- **`thread_id` is `` `${organization_id}_${session_id}` ``** — this binds a conversation to its checkpointer history. Changing the format detaches existing sessions from memory.
- **The checkpointer is one shared static `PostgresSaver` per process**, on the **same** Supabase Postgres as TypeORM (its tables live alongside entities — don't drop/rename them). Created only when `agent.with_history === true`.
- **`GenerateAIResponse` swallows all errors** into a pt-BR string ("Desculpe, tive um problema…"). Callers never see stack traces — observe via LangSmith/Sentry. LangSmith tracing is **always on** (`LANGSMITH_*` env vars required in every env).
- **`organization_id = null` means a global/admin agent** — token usage isn't recorded for them, and org filters must use `IS NULL` to surface them.
- **Known bug to not propagate:** `CreateAttendantAgent` stores `contexto` (pt) but `NormalizePromptInstructions` reads `context` (en). Standardize on `context` (the type) if you touch it. The skill body still shows `ChatVertexAI` in places — the project is on `ChatAnthropic` (see `langchain-anthropic-integration`); verify the live code, don't copy the stale type.
- **`UpdateAgent` is the sanctioned multi-endpoint exception** to "one controller = one endpoint" (`GET /agent`, `GET /agent/:id`, `PATCH /agent/:id`). Don't replicate the pattern elsewhere; don't merge it with the org-scoped `GET /agent/list`.
