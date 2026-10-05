---
name: agent-end-to-end-flow
description: 'Use for the cross-cutting AI agent lifecycle map: agent create + source ingestion → /support/question or /chat/attendant → ResolveAgent → GenerateAiResponse → LangGraph → tools (vector_similarity_search, execute_sql, parser, connected agents) → pgvector → message persistence. Start here for changes spanning AI areas; ai-agent-configuration / ai-agent-runtime / ai-agent-tools-and-rag / ai-chat-flows own the depth.'
---

This skill is the **wire diagram** of how a chat request becomes an AI response in `split-ai`. It overlaps with the four area skills on purpose: it is the one place where the whole pipeline is visible at once. For a surgical edit inside one area, open that area's skill; come back here when a change crosses areas (for example, a new prompt variable that must flow from a use case → `ResolveAgent` → a tool → the vector store).

The product is a personal engine with no tenants: there is no organization, billing, API key or third-party token anywhere in this flow. Paths are relative to `split-ai/`. Open the file before quoting a detail in a PR; the code is the source of truth.

## 0. Stack at a glance

| Layer            | Technology                                                                                                                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| HTTP             | NestJS 11 + Fastify 5; no global prefix; default port 4000                                                                                                                                                               |
| LLM              | `ChatAnthropic`, built only by the `CHAT_MODEL` port (`AnthropicChatModelFactory`; mock factory in tests). `agent.model` falls back to `env.AI_MODEL`; temperature falls back to 0.4; base URL from `ANTHROPIC_BASE_URL` |
| Orchestration    | `langchain` v1 `createAgent` (LangGraph), `streamMode: 'updates'`, `responseFormat: AgentFinalResponseSchema`                                                                                                            |
| Embeddings       | `EMBEDDINGS` port — Voyage `voyage-3-large`, 1024 dims                                                                                                                                                                   |
| Vector store     | `VECTOR_STORE` port — Supabase pgvector (`documents`, `match_documents`)                                                                                                                                                 |
| Reranker         | `RERANKER` port — Voyage `rerank-2.5` through `ResilientClient`                                                                                                                                                          |
| Relational store | PostgreSQL on Supabase via TypeORM (migrations, `synchronize: false`)                                                                                                                                                    |
| Memory           | `PostgresSaver` (`@langchain/langgraph-checkpoint-postgres`), one per process, same database                                                                                                                             |
| Ingestion        | `SITE_CRAWLER` (Spider) for sites; PDF / DOCX / text processors; `OCR` (Google Vision)                                                                                                                                   |
| Tracing          | LangSmith `LangChainTracer` (disabled in mock mode)                                                                                                                                                                      |

## 1. End-to-end sequence

```text
Phase A — Author the agent            (agent.write; load-sites and generate-source need agent.manage)
  POST /agent/create            → CreateAgentService         (agents + agents_instructions, in one transaction)
  POST /agent/create/attendant  → CreateAttendantAgentService
  PATCH /agent/:id              → UpdateAgentService         (UUID or agent_identifier)
  POST /agent-connection/*      → agent-as-tool wiring       (agent-connection.manage)

Phase B — Ingest knowledge
  POST /agent/generate-source   → GenerateAgentSourceService (multipart: file and/or comma-separated url)
  POST /agent/load-sites        → LoadAgentSitesService
      → VECTOR_STORE.upsertChunks(chunks, { source_type, agent_id, source_id })

Phase C — Receive a question
  POST /support/question (NDJSON stream) → QuestionController → QuestionService      (chat.ask)
  POST /chat/attendant   (one string)    → AttendantController → AttendantService    (chat.attend)
      AuthenticationGuard: Authorization: Bearer <HS256 JWT> → TokenVerifier → PrincipalResolverService
      AuthorizationGuard:  @RequirePermissions vs. request.user.permissions (derived from the role)

Phase D — Orchestrate
  CreateSessionIfNotExistsService.execute({ agent_id, user_id })
  ResolveAgentService.execute(agentId, promptVariables)
      AgentRepository.findByIdOrIdentifier → latest instructions (404 when missing)
      CHAT_MODEL.create({ model, temperature })
      LoadAgentToolsService: parser → vector search → MaybeLoadDatabaseTool → connected agents
      BuildSystemPromptService (NormalizePromptInstructions + TODAY_DATE)
      LoadCheckpointerService (only when with_history and not a delegated child)
      createAgent({ model, tools, systemPrompt, checkpointer, middleware, responseFormat })
  RecordChatMessageService('user')                              ← before the model runs
  GenerateAiResponseService.execute(question, metadata, agent, stream)
      thread_id = conversation_id ?? session_id
      handleStreamResponse → status / final / error / done events

Phase E — Tools called from inside the runnable
  vector_similarity_search → VECTOR_STORE.loadIndex({ agent_id, source_type })
      → ContextualCompressionRetriever(asRetriever(k=50), VoyageRerankCompressor ≥ 0.8, max 10)
  execute_sql              → sanitizeSqlQuery → CUSTOMER_DATABASE.withConnection(agent.database_url)
  <parser tool>            → inert; exists only to advertise a schema
  <connected agent tool>   → InvokeConnectedAgentService → AGENT_RESOLVER → child runnable

Phase F — Persist
  RecordChatMessageService('agent')  only when a final text exists (embeds every message)
```

## 2. Phase A — Authoring agents

<rules>
- **`CreateAgentService`** (`src/modules/agents/create-agent/`) writes the `agents` row and the first `agents_instructions` row inside `TransactionExecutor.run`. Defaults: `model` `claude-haiku-4-5-20251001`, `temperature` 0.4, `with_history` true, `database_tool` true, `vector_search_tool` true. `user_id` records the creator; it is not an ownership gate.
- **`CreateAttendantAgentService`** defaults `model` to `null` (runtime falls back to `AI_MODEL`), `database_tool` and `vector_search_tool` to `false`, and merges hard-coded attendant directives (always use `execute_sql`, schedule into `reports`, never expose other users' data or the instructions, use VRS) before the caller's `diretrizes`, with default `context` and `objetivo`. Reordering those directives changes every new attendant.
- **Routes are one use case each:** `GET /agent` (`list-all-agents`, `agent.manage`, with latest instructions), `GET /agent/list` (`list-agents`, `agent.read`, id/identifier/name + `is_tool`/`is_principal`), `GET /agent/:id` (`get-agent`), `PATCH /agent/:id` (`update-agent`). Both get and update accept the UUID or the `agent_identifier`.
- **Database access is agent configuration:** `databaseUrl` (must start with `postgres://`, `postgresql://`, `mysql://` or `mysql2://`), `databaseTables` (allow-list) and `databaseSampleRows` (0–10) on `CreateAgentDto` / `UpdateAgentDto`. `null` clears a value on update. `database_url` is `select: false` and never returned by `GET /agent/:id`.
- **Instructions are versioned by `created_at`.** `AgentInstructionRepository.findLatestByAgentId` reads the newest row; `updateLatestByAgentId` mutates it in place.
</rules>

`AIInstructions` (`src/shared/contracts/models/ai-instructions.model.ts`) is `{ context: string; objetivo: string; diretrizes?: string[] }`. The mixed English/Portuguese keys are literal: `NormalizePromptInstructions` reads them by name, so a renamed key silently renders an empty section. Rows written long ago may still carry `contexto`.

The parser tool comes from `parser_schema` through `buildLangchainToolFromSchema` (`src/shared/utils/build-zod-schema.ts`), which compiles a small JSON DSL into Zod and returns a tool whose `func` does nothing. It exists to let the model emit a structured argument; keep it side-effect free.

## 3. Phase B — Knowledge ingestion

<critical_rule>
Every chunk written to `documents` carries `agent_id` and `source_id` in its metadata (`buildSourceMetadata`, or explicitly in `LoadAgentSitesService`). The vector tool filters by `agent_id`, so a chunk without it is invisible to chat; `DeleteSource` removes vectors by `metadata->>source_id`, so a chunk without it becomes a permanent orphan.
</critical_rule>

- `GenerateAgentSourceService` resolves the agent by UUID or identifier, creates one `sources` row per file or URL with `status: 'processing'`, indexes them in parallel and marks each `completed` (with `chunk_count`) or `failed` (with `error_message`). Files go through `detectFileKind` → PDF / DOCX / text processors; URLs go through `LoadAgentSitesService` (Spider, limit 20, depth 25) and are appended to `agents.sites`.
- `SupabaseVectorStoreGateway.upsertChunks` strips NUL bytes from content, merges the caller's metadata over the chunk's, and writes with `SupabaseVectorStore.fromDocuments`.
- `DELETE /source/:id` calls `VECTOR_STORE.deleteBySourceId(id)` and soft-deletes the `sources` row.
- The `documents` table (1024-dim `embedding`), its index and `match_documents` live only in Supabase and are changed by hand in its SQL editor. Changing the embedding model requires changing the column dimension.

## 4. Phase C — HTTP entry

### `POST /support/question`

`QuestionController` calls `res.hijack()`, writes headers (`application/x-ndjson`, `X-Accel-Buffering: no`, `Cache-Control: no-store`) and then writes one JSON object per line. Events are `status` (`tool_call` / `tool_result` with the tool name), `final` (the answer text), `error` and always a closing `done`. After the hijack only `res.raw.write` is legal; the controller's own `try/catch` converts a thrown error into `error` + `done` because the global filter can no longer answer (PC-003).

`QuestionDto`: `question`, `agentId`, optional `conversationId`, `variables` (string map rendered in the prompt's VRS block), `phone`, `name`.

### `POST /chat/attendant`

`AttendantService` resolves the agent first with prompt variables `{ agentId, userName, userPhone, userId }`, creates the session, records the user message, runs the agent with `stream = false` and returns the `finalAnswer` string.

### Authentication

Only `Authorization: Bearer <JWT>` is accepted. `TokenVerifier` verifies the HS256 signature and expiry with `env.JWT_SECRET` and requires `sub` and a known `role`. `PrincipalResolverService` returns `AuthenticatedUser { id, name, email, phone, role, permissions }` without any I/O; `id` is always a string. Roles: `admin`, `user`, `guest` — every role has `chat.ask` and `chat.attend`. Catalog: `src/auth/permissions.ts`.

## 5. Phase D — Orchestration

### `QuestionService`

1. `CreateSessionIfNotExistsService.execute({ agent_id, user_id })` returns the user's active session for that agent, or expires the user's other sessions and creates one valid for one day.
2. `ResolveAgentService.execute(agentId, { ...dto.variables, sessionId, conversationId, threadId })` — the server-controlled keys overwrite anything the client sent.
3. `RecordChatMessageService.execute(..., 'user')` **before** the model runs. A failed run intentionally leaves the user's message without a reply.
4. `GenerateAiResponseService.execute(question, { session_id, conversation_id, user_id, agent_id }, agent, true)`; every event is forwarded to the controller.
5. When a `final` event produced text, record it as the `'agent'` message.

### `ResolveAgentService`

<rules>
- Looks the agent up by UUID or identifier; 404 when the agent or its instructions are missing.
- Tools are assembled by `LoadAgentToolsService` in this order: parser (when `parser_schema`), `vector_similarity_search` (when `vector_search_tool`), `execute_sql` (when `MaybeLoadDatabaseToolService.execute(agent)` returns one), then one tool per enabled `agent_connections` row (`AppendConnectionToolsService`).
- The same tool list is passed to `createAgent` and rendered into the prompt's `TOOLS:` section, so tool names and descriptions shape model behavior twice.
- `BuildSystemPromptService` = `NormalizePromptInstructions` (fixed legend line, then `OBJ`, `CTX`, `VRS` (one `key: value` per prompt variable), `DIR`, `TOOLS`) + `TODAY_DATE` in the server locale.
- The checkpointer (`LoadCheckpointerService`, a static `PostgresSaver` created in `onModuleInit` with `setup()`) is attached only when `agent.with_history` is true and the agent is not a delegated child.
- `createAgent` gets a `sanitize-tool-call-history` middleware that strips dangling `tool_use` blocks from history before every model call, so a run that died mid-tool cannot poison the thread with Anthropic 400s.
</rules>

### `GenerateAiResponseService`

<rules>
- `thread_id` is `metadata.conversation_id ?? metadata.session_id`. Changing that format detaches every stored conversation. The organization prefix it used to carry was removed from the `checkpoints`, `checkpoint_blobs` and `checkpoint_writes` tables by migration `RemoveMultiTenancy1759700000000`.
- Tags are `[NODE_ENV, agent.id]`; metadata carries `userId`, `sessionId`, `environment`.
- Streaming goes through `handleStreamResponse` (`src/shared/utils/handle-stream-response.ts`): model tool calls become `status/tool_call`, tool messages become `status/tool_result`, `structuredResponse.finalAnswer` becomes `final`. If the run ends without a structured response it falls back to the `finalAnswer` argument of the internal structured-output tool call, then to the last model text, else emits an `error`. It always ends with `done`. There are no token deltas: the client sees status chips and then the whole answer.
- Non-streaming parses `result.structuredResponse` with `AgentFinalResponseSchema` and falls back to the last message's text.
- Any exception becomes the Portuguese apology "Desculpe, tive um problema ao processar sua mensagem. Pode tentar novamente?" (or an `error` stream). Observe failures in LangSmith and Sentry, not in HTTP responses.
- `AgentFinalResponseSchema` (`src/shared/contracts/agent-response.ts`): only `finalAnswer` is load-bearing; the optional fields use `.catch(undefined)` so a model that emits them with the wrong JSON type does not invalidate the whole response.
</rules>

## 6. Phase E — Tools

### `vector_similarity_search`

`LoadVectorSearchToolService.execute(agentId)` defines `{ query, source_type ∈ business_context | memory | additional_directives }` and a Portuguese description that tells the model to always search first. `agent_id` is bound in the closure to the resolved agent's UUID (`LoadAgentToolsService` passes `dbAgent.id`), so principals and delegated children each search only their own chunks, with no prompt variable or instruction involved.

Retrieval is threshold-based: `asRetriever({ k: VECTOR_SEARCH_CANDIDATE_K })` (50) generates candidates, `VoyageRerankCompressor` keeps `relevance_score >= VECTOR_SEARCH_MIN_SCORE` (0.8) up to `VECTOR_SEARCH_MAX_RESULTS` (10), and the tool returns the page contents joined by blank lines. An empty result is a designed outcome; the compressor's warning logs the best score seen. Do not pass `filter` to `asRetriever` (the store already fixes it), import `ContextualCompressionRetriever` from `@langchain/classic` (PC-005), and keep the `as unknown as BaseRetrieverInterface` cast (PC-012). One search costs two Voyage calls (embed + rerank) on the same key (PC-007).

### `execute_sql`

Present only when `agents.database_tool = true` **and** `agents.database_url` is set. `MaybeLoadDatabaseToolService.execute(agent)` reads the URL, `database_tables` and `database_sample_rows` through `AgentRepository.findDatabaseConnection(id)` — the only query that selects `database_url`. `LoadDatabaseToolService` opens a short-lived connection through the `CUSTOMER_DATABASE` port, embeds the introspected schema (restricted to `database_tables` when set) and the dialect-aware "REGRAS DE OURO" in the description, and on each call runs `sanitizeSqlQuery`: single statement; first verb `SELECT`/`INSERT`/`UPDATE`; deny regex `DELETE|ALTER|DROP|CREATE|REPLACE|TRUNCATE`; `LIMIT 5` appended when missing. A rejected query returns a Portuguese message to the model instead of throwing. For read-only access, put a read-only database user in `database_url`.

### Connected agents

Each enabled `agent_connections` row becomes a `DynamicStructuredTool` named `tool_name` with input `{ input: string }`. `InvokeConnectedAgentService` resolves the child through the `AGENT_RESOLVER` port (lazy `ModuleRef` lookup that breaks the module cycle, PC-008), invokes it with `thread_id: conn_<childId>` and returns its `finalAnswer`. Depth is capped at 1 (`MAX_AGENT_CONNECTION_DEPTH`), circular visits are refused, and children never get a checkpointer, so each delegation is stateless and a specialist must be self-contained.

## 7. Phase F — Persistence

`RecordChatMessageService` embeds the message through `EMBEDDINGS` and writes `messages` (`session_id`, `user_id`, `agent_id`, `from`, `message`, `embedding`). It swallows errors so a recording failure never aborts the chat; call it, never `MessageRepository` directly. Every turn costs two embeddings — the first place to cache if Voyage spend grows.

## 8. Tables touched

| Table                       | Written by                                                                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `agents`                    | `CreateAgent`, `CreateAttendantAgent`, `UpdateAgent`, `GenerateAgentSource` (`sites`), `SaveAgentConnectionLayout` (`canvas_layout`) |
| `agents_instructions`       | `CreateAgent`, `CreateAttendantAgent`, `UpdateAgent`                                                                                 |
| `agent_connections`         | agent-connections use cases                                                                                                          |
| `sessions`                  | `CreateSessionIfNotExists`                                                                                                           |
| `messages`                  | `RecordChatMessage`                                                                                                                  |
| `sources`                   | `GenerateAgentSource`, `DeleteSource`                                                                                                |
| `documents` (Supabase only) | `VECTOR_STORE.upsertChunks`, `deleteBySourceId`                                                                                      |
| `checkpoint*` (LangGraph)   | `PostgresSaver`; created by `setup()` at boot                                                                                        |
| external databases          | `execute_sql`, per agent                                                                                                             |

## 9. Environment the flow reads

Through `src/shared/config/env.ts`, except the `LANGSMITH_*` variables the tracer reads itself: `AI_MODEL`, `ANTHROPIC_API_KEY`, `ANTHROPIC_BASE_URL`, `ORCHESTRATOR_MODEL`, `VOYAGEAI_API_KEY`, `EMBEDDING_MODEL`, `RERANK_MODEL`, `VECTOR_SEARCH_CANDIDATE_K` / `_MIN_SCORE` / `_MAX_RESULTS`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL` (TypeORM and `PostgresSaver`), `CUSTOMER_DATABASE_*`, `SPIDER_API_KEY`, `LANGCHAIN_PROJECT`, `JWT_SECRET`, `INTEGRATION_MODE`. Never echo their values.

## 10. Module graph (chat path)

```text
AppModule
├── IntegrationModule            @Global(): MESSAGING, EMBEDDINGS, VECTOR_STORE, RERANKER, CHAT_MODEL, SITE_CRAWLER,
│                                FILE_STORAGE, TEXT_TO_SPEECH, OCR, CUSTOMER_DATABASE (live or mock)
├── AuthModule                   the two APP_GUARDs
├── AgentRuntimeContractsModule  @Global(): AGENT_RESOLVER
├── ChatModule                   QuestionModule, AttendantModule, RecordChatMessageModule
├── AgentRuntimeModule           ResolveAgent, GenerateAiResponse, BuildSystemPrompt, NormalizePromptInstructions,
│                                LoadCheckpointer, AppendConnectionTools, InvokeConnectedAgent
├── RetrievalModule              LoadAgentTools, LoadVectorSearchTool, ExecuteSimilaritySearch, RerankDocuments,
│                                MaybeLoadDatabaseTool (imports AgentRepositoryModule), LoadDatabaseTool
└── AgentsModule, AgentConnectionsModule, SourcesModule, SessionsModule, ReportsModule, …
```

Each use-case module imports exactly what its classes inject; integration ports need no import. Check wiring with `bun run di:verify && bun run di:boot-check`. The rules behind this are in `.claude/rules/nest-modules.md`.

## 11. Pitfalls

1. **`thread_id` format** — change it and every conversation forgets its history.
2. **Chunks without `agent_id` / `source_id`** — invisible to search / undeletable.
3. **`execute_sql` missing** — check `database_tool` and `database_url` on the agent itself.
4. **Empty retrieval** — read the `VoyageRerankCompressor` warning before touching code; tune `VECTOR_SEARCH_MIN_SCORE`.
5. **`vector_search_tool = true` with nothing ingested** — the model always searches and gets nothing; ingest first or disable the tool.
6. **Delegated children are stateless and depth-1** — specialists must carry everything they need in their own instructions.
7. **Schema changes need migrations** — `synchronize` is off; `/health/startup` stays 503 until the CI `migrate` job runs.

## 12. Where to go deeper

- `ai-agent-configuration` — CRUD, DTOs, instruction shape, parser DSL, attendant defaults.
- `ai-agent-runtime` — `ResolveAgent`, `GenerateAiResponse`, streaming, checkpointer, structured response.
- `ai-agent-tools-and-rag` — vector and SQL tools, guardrails, `documents`, Spider ingestion.
- `ai-chat-flows` — Question vs. Attendant, Fastify hijack mechanics.
- `.claude/rules/nest-modules.md`, `.claude/rules/use-cases.md`, `.claude/rules/conventions.md` — module wiring, controller/service/DTO rules and naming this flow follows.
- `tech-stack` — each external integration and its env vars.
- `thinking-flow` — how to reason about changes before writing code.
