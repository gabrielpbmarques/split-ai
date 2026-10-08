---
trigger: always_on
---

# AI agents: configuration and runtime

Thin path-scoped reminder. Full detail: **`ai-agent-configuration`** (CRUD, prompts, tables) and **`ai-agent-runtime`** (ResolveAgent, GenerateAiResponse, memory, tracing). For RAG and tools see **`ai-agent-tools-and-rag`**.

<rules>
- **`AIInstructions` keys are literal.** `NormalizePromptInstructions` reads `instructions.context`, `instructions.objetivo` and `instructions.diretrizes` by name (type in `src/shared/contracts/models/ai-instructions.model.ts`). Renaming a key silently renders that prompt section as `undefined`, and `diretrizes` must be a non-empty array or `flatMap` throws. `ResolveAgent` answers 404 for an agent without instructions.
- **Dual-key lookup.** `ResolveAgent`, `GetAgent` and `UpdateAgent` accept either the UUID or the `agent_identifier` in the same parameter (`AgentRepository.findByIdOrIdentifier`). Keep the UUID-then-identifier pattern.
- **`thread_id` is `conversationId ?? session.id`** (built in `GenerateAiResponse`). It binds a conversation to its checkpointer history: changing the format detaches every stored thread. The organization prefix it used to carry was stripped from the checkpoint tables by the `RemoveMultiTenancy1759700000000` migration. Delegated children use `conn_<childAgentId>`.
- **One shared `PostgresSaver` per process** (`LoadCheckpointerService`), on the same Postgres as TypeORM; its `checkpoint*` tables belong to the library — never drop, rename or declare entities for them. It is attached only when `agent.with_history` is true and never to a delegated child (`connectionContext.depth > 0`), because the 0.x/1.x LangGraph skew crashes on `MemorySaver.put()`.
- **Agent-as-tool depth is 1** (`MAX_AGENT_CONNECTION_DEPTH`). A child cannot delegate further, so a specialist tool must be self-contained. Connections go through the `AGENT_RESOLVER` port to avoid the `InvokeConnectedAgent` → `ResolveAgent` module cycle (PC-008).
- **`GenerateAiResponse` swallows errors** into a Portuguese apology ("Desculpe, tive um problema…"); callers never see stack traces, so observe through LangSmith/Sentry. The structured `finalAnswer` (`AgentFinalResponseSchema`) is the load-bearing output that becomes the streamed `final` event; when adding streamed output, add a new branch instead of changing that one.
- **Agent database access is configured on the agent** (`database_tool`, `database_url`, `database_tables`, `database_sample_rows`), through `CreateAgentDto` / `UpdateAgentDto` (`databaseUrl`, `databaseTables`, `databaseSampleRows`). `GetAgent` never returns `database_url`.
- **Known inconsistency:** older `agents_instructions` rows may still carry `contexto` instead of `context`. Standardize on `context` if you touch them.
- **Live runtime is `ChatAnthropic`** through the `CHAT_MODEL` port (see `langchain-anthropic-integration`); verify the live code rather than copying stale snippets from skill bodies.
</rules>
