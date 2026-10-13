---
trigger: always_on
---

# AI agents: configuration and runtime

Thin path-scoped reminder. Full detail: **`ai-agent-configuration`** (CRUD, system_prompt, tables) and **`ai-agent-runtime`** (ResolveAgent, GenerateAiResponse, Deep Agents, Store, tracing). For RAG and tools see **`ai-agent-tools-and-rag`**.

<rules>
- **System prompt is unified in Markdown.** `AgentEntity.system_prompt` holds the instructions directly. The former `agents_instructions` table and decomposed keys (`context`, `objetivo`, `diretrizes`) were eliminated.
- **Dual-key lookup.** `ResolveAgent`, `GetAgent` and `UpdateAgent` accept either the UUID or the `agent_identifier` in the same parameter (`AgentRepository.findByIdOrIdentifier`). Keep the UUID-then-identifier pattern.
- **`thread_id` is `conversationId ?? session.id`** (built in `GenerateAiResponse`). It binds a conversation to its session/thread history: changing the format detaches every stored thread.
- **Deep Agents runtime with PostgresStore.** `ResolveAgentService` instantiates agents via `createDeepAgent` (`deepagents`) with `CompositeBackend`: `StateBackend` (root efêmero) e `StoreBackend` para `/memories/` e `/skills/` persistidos no Supabase através do `PostgresStore` (`@langchain/langgraph-checkpoint-postgres/store`).
- **Tools via array.** Tools are configured via `tools: string[]` on `AgentEntity` and loaded by `ToolLoaderService`. The external database connection (`execute_sql`, `CUSTOMER_DATABASE`) was removed.
- **`GenerateAiResponse` swallows errors** into a Portuguese apology ("Desculpe, tive um problema…"); callers never see stack traces, so observe through LangSmith/Sentry. The structured `finalAnswer` (`AgentFinalResponseSchema`) is the load-bearing output that becomes the streamed `final` event.
- **Live runtime is `ChatAnthropic`** through the `CHAT_MODEL_SERVICE` provider (`IChatModelService`, default model `deepseek-chat-v3.2` via Anthropic-compatible endpoint).
</rules>
