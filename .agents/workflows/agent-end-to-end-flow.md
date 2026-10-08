---
description: Use for the cross-cutting AI agent lifecycle map
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
Phase A — Author the agent            (agent.write; load-sites needs agent.manage)
  POST /agent/create            → CreateAgentService         (agents + agents_instructions, in one transaction)
  PATCH /agent/:id              → UpdateAgentService         (UUID or agent_identifier)
  POST /agent-connection/*      → agent-as-tool wiring       (agent-connection.manage)

Phase B — Ingest knowledge
  POST /agent/generate-source   → GenerateAgentSourceService (source.write; multipart: file and/or comma-separated url; 202, indexes in the background)
  POST /agent/load-sites        → LoadAgentSitesService
      → VECTOR_STORE.upsertChunks(chunks, { source_type, agent_id, source_id })

Phase C — Receive a question
  POST /chat (NDJSON stream) → QuestionController → QuestionService      (chat.ask)
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
  vector_similarity_search → VECTOR_STORE.loadIndex({ agent_id })
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

### `POST /chat`

`QuestionController` calls `res.hijack()`, writes headers (`application/x-ndjson`, `X-Accel-Buffering: no`, `Cache-Control: no-store`) and then writes one JSON object per line. Events are `status` (`tool_call` / `tool_result` with the tool name), `final` (the answer text), `error` and always a closing `done`. After the hijack only `res.raw.write` is legal; the controller's own `try/catch` converts a thrown error into `error` + `done` because the global filter can no longer answer (PC-003).

`QuestionDto`: `question`, `agentId`, optional `conversationId`, `variables` (string map rendered in the prompt's VRS block), `phone`, `name`.

### Authentication

Only `Authorization: Bearer <JWT>` is accepted. `TokenVerifier` verifies the HS256 signature and expiry with `env.JWT_SECRET` and requires `sub` and a known `role`. `PrincipalResolverService` returns `AuthenticatedUser { id, name, email, phone, role, permissions }` without any I/O; `id` is always a string. Roles: `admin`, `user`, `guest` — every role has `chat.ask`. Catalog: `src/auth/permissions.ts`.

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
- Tools are assembled by `LoadAgentToolsService` in this order: parser (when `parser_schema`), `vector_similarity_search` (when `vector_search_tool`), `execute_sql` (when `MaybeLoadDatabaseToolSe
