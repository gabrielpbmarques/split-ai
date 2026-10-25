---
name: ciclo-de-vida-do-agente
description: 'Mapa ponta a ponta do ciclo de vida do agente de IA no Sherlock AI: criação do agente + ingestão de fontes → POST /chat/:agentId → ResolveAgent → GenerateAiResponse → runtime deepagents (CompositeBackend / PostgresStore / PostgresSaver) → ferramentas (vector_search, tavily_search) → pgvector → persistência de mensagens.'
---

# Ciclo de vida ponta a ponta do agente de IA

Esta skill é o **mapa transversal** de como um agente é configurado, alimentado com fontes e executado em uma conversa no Sherlock AI (`split-ai`). Ela conecta as quatro skills específicas da área (`configuracao-de-agentes`, `execucao-de-agentes`, `ferramentas-e-rag` e `fluxo-de-chat`) em uma única visão integrada.

O produto é um motor pessoal de IA sem multi-tenancy: não há organização, cobrança, chave de API ou token de terceiros em nenhum ponto deste fluxo.

## 0. Visão rápida da stack de IA

<tabela>

| Camada                  | Tecnologia no `split-ai`                                                                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| HTTP / Streaming        | NestJS 11 + Fastify 5 (`res.hijack()` com NDJSON em `POST /chat/:agentId`); porta padrão `4000`                                                                                      |
| Modelo de chat (LLM)    | `ChatAnthropic` via provedor `CHAT_MODEL_SERVICE` (`IChatModelService`). Padrão no runtime: `deepseek-chat-v3.2` (ou `deepseek-flash` na criação do agente) via `ANTHROPIC_BASE_URL` |
| Orquestração de agentes | `deepagents` (`createDeepAgent`), `streamMode: 'updates'`, `CompositeBackend` (`StateBackend` + `StoreBackend`)                                                                      |
| Memória e Skills (VFS)  | `PostgresStore` via `LoadStoreService`, montado nos namespaces `['memories'\|'skills'\|'scratchpad', agentId, 'filesystem']`                                                         |
| Histórico de thread     | `PostgresSaver` via `LoadCheckpointerService` (`MemorySaver` em modo `mock`), chaveado por `thread_id = conversationId ?? session.id`                                                |
| Embeddings              | Provedor `EMBEDDINGS_SERVICE` — Voyage AI `voyage-3-large` (1024 dimensões)                                                                                                          |
| Vector store            | Provedor `VECTOR_STORE_SERVICE` — Supabase `pgvector` (tabela `documents`, RPC `match_documents`)                                                                                    |
| Reranker                | Provedor `RERANKER_SERVICE` — cross-encoder Voyage AI `rerank-2.5` via `ResilientClient`                                                                                             |
| Busca web               | Provedor `TAVILY_SEARCH_SERVICE` — `@langchain/tavily` (`TavilySearchService`)                                                                                                       |
| Banco relacional        | PostgreSQL no Supabase via TypeORM 0.3 (`synchronize: false`, migrations via CLI)                                                                                                    |
| Ingestão e OCR          | Processadores PDF / DOCX / texto / imagem (`GOOGLE_VISION_SERVICE`) e web crawling (`SPIDER_SERVICE`)                                                                                |
| Tracing                 | LangSmith `LangChainTracer` (desativado automaticamente em `INTEGRATION_MODE=mock`)                                                                                                  |

</tabela>

## 1. Sequência ponta a ponta

<estrutura>
```text
Fase A — Configurar o agente e suas conexões
  POST /agent/create                  → CreateAgentService          (agent.write; cria AgentEntity com system_prompt, tools, response_format)
  PATCH /agent/:id                    → UpdateAgentService          (agent.write; aceita UUID ou agent_identifier)
  POST /agent-connection/create       → CreateAgentConnectionService(agent-connection.manage; vincula subagente como ferramenta)
  GET /agent/:id/knowledge-graph      → GetKnowledgeGraphService    (agent.read; grafo de agente, tools, memórias, skills e fontes)
  bun run seed:memories [identifier]  → scripts/seed-memories.ts    (sincroniza memories/, skills/ e scratchpad/ locais com o PostgresStore)

Fase B — Ingerir fontes de conhecimento
POST /agent/generate-source → GenerateAgentSourceService (source.write; valida, cria linhas 'processing', responde 202 Accepted)
└─ tarefa em background (Promise.allSettled):
process-*-source / load-agent-sites
→ VECTOR_STORE_SERVICE.upsertChunks(chunks, { agent_id, source_id })
→ atualiza status da fonte para 'completed' ou 'failed'

Fase C — Receber pergunta no chat
POST /chat/:agentId (stream NDJSON) → QuestionController → QuestionService (chat.ask)
├─ AuthenticationGuard: Authorization: Bearer <HS256 JWT> → TokenVerifier → PrincipalResolverService
├─ AuthorizationGuard: @RequirePermissions('chat.ask') vs. request.user.permissions
└─ QuestionController faz res.hijack() e escreve cabeçalhos NDJSON (X-Accel-Buffering: no)

Fase D — Orquestrar sessão e resolver o agente
CreateSessionIfNotExistsService.execute({ agent_id, user_id, session_id: dto.threadId }) (sessão expira em 8h)
ResolveAgentService.execute(agentId)
├─ AgentRepository.findByIdOrIdentifier(agentId)
└─ Promise.all([
LoadStoreService.execute(), → PostgresStore
LoadCheckpointerService.execute(), → PostgresSaver
ToolLoaderService.execute(agentPayload), → vector_search, tavily_search, subagentes conectados
ResolveSystemPromptService.execute(agentPayload), → memories/<identifier>/AGENT.md ou agent.system_prompt
ResolveMemorySourcesService.execute(agentPayload.id), → ['/memories/...', '/scratchpad/notes.md']
ResolveSkillSourcesService.execute(agentPayload.agent_identifier), → ['/skills/<identifier>/', '/skills/shared/', '/skills/']
])
└─ createDeepAgent({ model, tools, systemPrompt, memory, skills, checkpointer, store, backend: CompositeBackend })

Fase E — Persistir pergunta e executar o runtime
RecordChatMessageService.execute(..., 'user') ← gravado ANTES de chamar o modelo
GenerateAiResponseService.execute(question, metadata, agent, true)
├─ thread_id = conversation_id ?? session_id
├─ monta schema de saída (AgentFinalResponseSchema + agent.response_format)
└─ handleStreamResponse → emite eventos NDJSON: status / token / final / error / done

Fase F — Ferramentas invocadas pelo modelo durante a execução
vector_similarity_search ({ query })
→ VECTOR_STORE_SERVICE.loadIndex({ agent_id }) ← agent_id fechado por closure no servidor
→ ContextualCompressionRetriever(asRetriever(k=50), VoyageRerankCompressor >= 0.8, máx 10)
tavily_search ({ query, ... })
→ TAVILY_SEARCH_SERVICE.search(...)

Fase G — Persistir resposta final do agente
RecordChatMessageService.execute(..., 'agent') ← gravado APENAS se o evento `final` produziu texto não vazio

```
</estrutura>

## 2. Onde aprofundar em cada fase

- **Fase A (CRUD, `system_prompt`, conexões e grafo de conhecimento):** leia `.agents/rules/08-agentes-de-ia.md` e a skill `configuracao-de-agentes`.
- **Fase B e Fase F (Tools, busca vetorial por limiar e ingestão `202`):** leia `.agents/rules/09-ferramentas-e-rag.md` e a skill `ferramentas-e-rag`.
- **Fase D e Fase E (`ResolveAgent`, `CompositeBackend`, `PostgresStore`, `GenerateAiResponse`):** leia `.agents/rules/08-agentes-de-ia.md` e a skill `execucao-de-agentes`.
- **Fase C e Fase G (`POST /chat/:agentId`, hijack NDJSON e sessões de 8h):** leia `.agents/rules/10-chat-e-streaming.md` e a skill `fluxo-de-chat`.
```
