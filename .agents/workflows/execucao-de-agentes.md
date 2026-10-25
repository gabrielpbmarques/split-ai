---
description: 'Runtime de execução de agentes no momento da requisição: ResolveAgent, GenerateAiResponse, createDeepAgent (deepagents), CompositeBackend, StoreBackend, PostgresStore, PostgresSaver, respostas estruturadas (AgentFinalResponseSchema), memória de thread via thread_id e tracing no LangSmith.'
---

# Execução de agentes em tempo real (`agent-runtime` e `store`)

Cobre: como um agente é montado e executado em `src/modules/agent-runtime/` e `src/modules/store/`. Regras base em `.agents/rules/08-agentes-de-ia.md`.

## `ResolveAgentService` — `src/modules/agent-runtime/resolve-agent/resolve-agent.service.ts`

`execute(agentId: string): Promise<ResolvedAgent>`:

1. **Busca do agente:** `this.agentRepository.findByIdOrIdentifier(agentId)` aceita tanto o UUID quanto o `agent_identifier`. Lança `NotFoundException('Agente não encontrado')` quando nenhum corresponder.
2. **Resolução paralela de dependências (`Promise.all`):**
   - `loadStoreService.execute()`: retorna a instância compartilhada do `PostgresStore` (ou `InMemoryStore` em `INTEGRATION_MODE === 'mock'`);
   - `loadCheckpointerService.execute()`: retorna a instância compartilhada do `PostgresSaver` (ou `MemorySaver` em `INTEGRATION_MODE === 'mock'`);
   - `toolLoaderService.execute(agentPayload)`: instancia as ferramentas de `agent.tools` (`vector_search`, `tavily_search`) e anexa os subagentes conectados (`AppendConnectionToolsService`);
   - `resolveSystemPromptService.execute(agentPayload)`: se `agent_identifier` existir, tenta ler `memories/<agent_identifier>/AGENT.md` do disco (`process.cwd()`); caso contrário, usa `agentPayload.system_prompt`;
   - `resolveMemorySourcesService.execute(agentPayload.id)`: lista os arquivos `.md` (exceto `/AGENT.md`) no namespace `['memories', agentId, 'filesystem']` do `PostgresStore`, prefixa com `/memories` e adiciona `/scratchpad/notes.md`;
   - `resolveSkillSourcesService.execute(agentPayload.agent_identifier)`: retorna `['/skills/<identifier>/', '/skills/shared/', '/skills/']` (ou `['/skills/shared/', '/skills/']` sem identificador).
3. **Modelo de chat:** `this.chatModelService.createModel({ model: agentPayload.model ?? 'deepseek-chat-v3.2', temperature: agentPayload.temperature ?? 0.3 })` via `CHAT_MODEL_SERVICE` (`ChatAnthropic`).
4. **Montagem do Deep Agent (`createDeepAgent` de `deepagents`):**
   - `backend`: `CompositeBackend` com `StateBackend` efêmero na raiz e três rotas persistidas via `StoreBackend`:
     - `/memories/` → namespace `['memories', agentPayload.id, 'filesystem']`
     - `/skills/` → namespace `['skills', agentPayload.id, 'filesystem']`
     - `/scratchpad/` → namespace `['scratchpad', agentPayload.id, 'filesystem']`
   - Retorna o `DeepAgent` anexado aos metadados do `AgentEntity` (`ResolvedAgent`).

## `LoadStoreService` e `LoadCheckpointerService` — `src/modules/store/`

- `LoadStoreService` (`src/modules/store/load-store/load-store.service.ts`): mantém um `PostgresStore` singleton por processo conectado a `env.DATABASE_URL` e garante o DDL idempotente da tabela `public.store` (PC-019). Em `INTEGRATION_MODE === 'mock'`, retorna `InMemoryStore`.
- `LoadCheckpointerService` (`src/modules/store/load-checkpointer/load-checkpointer.service.ts`): mantém um `PostgresSaver` singleton por processo (com `.setup()`). Em `INTEGRATION_MODE === 'mock'`, retorna `MemorySaver`.
- Para popular memórias, skills e scratchpad locais no `PostgresStore`, execute `bun run seed:memories [agentIdentifier]` (`scripts/seed-memories.ts`).

## `GenerateAiResponseService` — `src/modules/agent-runtime/generate-ai-response/generate-ai-response.service.ts`

`execute(question, metadata: CustomMetadata, agent: ResolvedAgent, stream = false)` retorna `Promise<string | AsyncGenerator<StreamEvent>>`.

### Configuração de invocação e `thread_id`

```ts
const threadKey = metadata.conversation_id ?? metadata.session_id;
```

- **`thread_id` é sempre `conversation_id ?? session_id`.** Ele vincula a conversa à sua thread de checkpoints no `PostgresSaver`. Alterar esse formato desconecta todo o histórico salvo.
- O tracing do LangSmith (`LangChainTracer`) é ativado automaticamente quando `env.INTEGRATION_MODE !== 'mock'` e `env.LANGCHAIN_API_KEY` está configurada.

### Schema de saída estruturada (`AgentFinalResponseSchema`)

definido em `src/shared/contracts/agent-response.ts`:

```ts
z.object({
  finalAnswer: z.string(),
  confidence: z.number().min(0).max(1).optional().catch(undefined),
  needsClarification: z.boolean().optional().catch(undefined),
  sources: z.array(z.string()).optional().catch(undefined),
  toolCallsUsed: z.array(z.string()).optional().catch(undefined),
});
```

Quando o agente possui `agent.response_format` configurado no banco, `GenerateAiResponseService` mescla os campos customizados ao `AgentFinalResponseSchema`. O campo `finalAnswer` é a resposta principal entregue no evento `final`.

### Modo streaming vs. não-streaming

- **Streaming (`stream = true`, usado em `POST /chat/:agentId`):** chama `agent.stream(..., { ...configurable, streamMode: 'updates' })` e consome os updates com `handleStreamResponse` (`src/shared/utils/handle-stream-response.ts`), emitindo eventos `StreamEvent` (`step`/`status`, `token`, `final`, `error`, `done`).
- **Não-streaming (`stream = false`, usado em WhatsApp e chamadas internas):** aguarda a execução e extrai `structuredResponse.finalAnswer` (ou o texto da última `AIMessage`).

### Captura de erros e sanitização de `tool_use`

- Todo o método `execute()` é protegido por `try/catch`: qualquer falha na LLM ou no grafo é registrada no logger estruturado e convertida na mensagem amigável `'Desculpe, tive um problema ao processar sua mensagem. Pode tentar novamente?'` (ou em um `errorStream` no modo streaming). O chamador nunca recebe stack traces crus.
- `sanitizeToolCallMessages` remove chamadas `tool_use` órfãs (sem `ToolMessage` correspondente) antes de enviar mensagens ao modelo, evitando rejeições HTTP 400 da API Anthropic/DeepSeek quando uma execução anterior foi interrompida. Caso um checkpoint no banco fique corrompido, use `bun run repair:thread <threadId>`.
