---
name: agent-end-to-end-flow
description: 'Use for the cross-cutting AI agent lifecycle map: agent create + source ingestion → /chat/:agentId → ResolveAgent → GenerateAiResponse → deepagents runtime → tools (vector_search) → pgvector → message persistence. Start here for changes spanning AI areas; ai-agent-configuration / ai-agent-runtime / ai-agent-tools-and-rag / ai-chat-flows own the depth.'
---

This skill is the **wire diagram** of how a chat request becomes an AI response in `split-ai`. It overlaps with the four area skills on purpose: it is the one place where the whole pipeline is visible at once.

The product is a personal engine with no tenants: there is no organization, billing, API key or third-party token anywhere in this flow. Paths are relative to `split-ai/`.

## 0. Stack at a glance

| Layer            | Technology                                                                                                                         |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| HTTP             | NestJS 11 + Fastify 5; default port 4000                                                                                           |
| LLM              | `ChatAnthropic`, built only by the `CHAT_MODEL` port (`AnthropicChatModelFactory`). `agent.model` defaults to `deepseek-chat-v3.2` |
| Orchestration    | `deepagents` (`createDeepAgent`), `streamMode: 'updates'`, `CompositeBackend` (`StateBackend` + `StoreBackend`)                    |
| Embeddings       | `EMBEDDINGS` port — Voyage `voyage-3-large`, 1024 dims                                                                             |
| Vector store     | `VECTOR_STORE` port — Supabase pgvector (`documents`, `match_documents`)                                                           |
| Reranker         | `RERANKER` port — Voyage `rerank-2.5` through `ResilientClient`                                                                    |
| Relational store | PostgreSQL on Supabase via TypeORM (migrations, `synchronize: false`)                                                              |
| Agent Memory     | `PostgresStore` via `LoadStoreService`, mounted at `/memories/` and `/skills/` namespaces                                          |
| Ingestion        | PDF / DOCX / text processors; `OCR` (Google Vision)                                                                                |
| Tracing          | LangSmith `LangChainTracer` (disabled in mock mode)                                                                                |

## 1. End-to-end sequence

```text
Phase A — Author the agent            (agent.write)
  POST /agent/create            → CreateAgentService         (AgentEntity: system_prompt, tools, response_format)
  PATCH /agent/:id              → UpdateAgentService         (UUID or agent_identifier)

Phase B — Ingest knowledge
  POST /agent/generate-source   → GenerateAgentSourceService (source.write; 202, indexes in the background)
      → VECTOR_STORE.upsertChunks(chunks, { agent_id, source_id })

Phase C — Receive a question
  POST /chat/:agentId (NDJSON)  → QuestionController → QuestionService (chat.ask)
      AuthenticationGuard: Authorization: Bearer <HS256 JWT> → TokenVerifier → PrincipalResolverService
      AuthorizationGuard:  @RequirePermissions vs. request.user.permissions

Phase D — Orchestrate
  CreateSessionIfNotExistsService.execute({ agent_id, user_id }) (session expires after 8 hours)
  ResolveAgentService.execute(agentId)
      AgentRepository.findByIdOrIdentifier → agent entity
      LoadStoreService → PostgresStore
      CHAT_MODEL.create({ model, temperature })
      ToolLoaderService → maps agent.tools ('vector_search')
      createDeepAgent({ model, tools, memory, skills, store, backend })
  RecordChatMessageService('user')                              ← before the model runs
  GenerateAiResponseService.execute(question, metadata, agent, stream)
      thread_id = conversation_id ?? session_id
      handleStreamResponse → status / final / error / done events

Phase E — Tools called from inside the runnable
  vector_search → VECTOR_STORE.loadIndex({ agent_id })
      → ContextualCompressionRetriever(asRetriever(k=50), VoyageRerankCompressor ≥ 0.8, max 10)

Phase F — Persist
  RecordChatMessageService('agent')  only when a final text exists (embeds every message)
```

## 2. Phase A — Authoring agents

- `CreateAgentService` writes directly to `AgentRepository.create`. Defaults: `model: 'deepseek-chat-v3.2'`, `temperature: 0.4`, `with_history: true`, `tools: ['vector_search']`. `system_prompt` is required.
- `UpdateAgentService` applies partial updates to `AgentEntity`.
- Lookup accepts UUID or `agent_identifier`.

## 3. Phase B — Knowledge ingestion

Every chunk written to `documents` carries `agent_id` and `source_id` in its metadata. The vector search tool filters by `agent_id`.

## 4. Phase C — HTTP entry

- `POST /chat/:agentId` stream via Fastify hijack.
- Body: `QuestionDto` (`{ question, threadId?, variables? }`).

## 5. Phase D & E — Runtime & Tools

- Runtime uses `createDeepAgent` from `deepagents`.
- Memory is managed with `PostgresStore` under namespaces `['agents', agent.id, 'memories']` and `['agents', agent.id, 'skills']`.
- Tools are loaded dynamically by `ToolLoaderService`.
