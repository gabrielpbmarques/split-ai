---
trigger: glob
description: 'Agentes de IA: configuração (system_prompt, tools, response_format, conexões, grafo de conhecimento) e runtime (ResolveAgent, Deep Agents, CompositeBackend, PostgresStore, PostgresSaver, GenerateAiResponse).'
globs: 'src/modules/agents/**, src/modules/agent-connections/**, src/modules/agent-runtime/**, src/modules/store/**, memories/**, skills/**, scratchpad/**'
---

# Agentes de IA: configuração e runtime

Cobre: configuração e CRUD de agentes (`src/modules/agents/`), conexões hierárquicas (`src/modules/agent-connections/`), armazenamento de memória/skills (`src/modules/store/`) e execução em tempo real (`src/modules/agent-runtime/`). Para detalhes passo a passo, consulte as skills `configuracao-de-agentes`, `execucao-de-agentes` e `ciclo-de-vida-do-agente`. Para RAG e ferramentas, veja `09-ferramentas-e-rag.md`.

## Configuração de agentes (`src/modules/agents/`)

<regras>
- **Prompt de sistema unificado em Markdown (`system_prompt`):** `AgentEntity.system_prompt` (TEXT) armazena as instruções completas do agente diretamente na tabela `agents`. A antiga tabela `agents_instructions` e a divisão em `context`, `objetivo` e `diretrizes` foram eliminadas.
- **Busca por chave dupla (UUID ou `agent_identifier`):** `ResolveAgent`, `GetAgent`, `UpdateAgent` e `GetKnowledgeGraph` aceitam tanto o UUID quanto o `agent_identifier` no mesmo parâmetro, delegando para `AgentRepository.findByIdOrIdentifier(idOrIdentifier)`. Mantenha sempre o padrão UUID-primeiro, depois `agent_identifier`.
- **Defaults de criação (`CreateAgentService`):** `model` assume `'deepseek-flash'` quando omitido no DTO (`dto.model ?? 'deepseek-flash'`), `temperature: 0.4`, `with_history: true` e `tools: ['vector_search']` quando não informado. Como a criação escreve apenas na tabela `agents`, `CreateAgentService` e `UpdateAgentService` não abrem transação.
- **Ferramentas via array de strings (`tools`):** `AgentEntity.tools` armazena os identificadores das ferramentas ativas (ex.: `['vector_search', 'tavily_search']`), carregadas dinamicamente pelo `ToolLoaderService` (`09-ferramentas-e-rag.md`). A antiga ferramenta de banco externo (`execute_sql`, `CUSTOMER_DATABASE`) foi removida.
- **Saída estruturada (`response_format`):** `AgentEntity.response_format` (JSONB) armazena a definição de schema JSON opcional que é combinada ao `AgentFinalResponseSchema` durante a execução em `GenerateAiResponseService`.
- **Sem cotas e sem propriedade restritiva:** `user_id` registra quem criou o agente, mas qualquer usuário com permissão `agent.read` / `agent.write` pode ler e editar qualquer agente.
</regras>

## Conexões entre agentes e Canvas (`agent_connections`)

<regras>
- **Papéis derivados de `agent_connections`:** um agente principal pode se conectar a subagentes (que atuam como ferramentas dele). Os campos `is_tool`, `is_principal` e `has_tools` (em `GET /agent/:id`: `isTool`, `isPrincipal`, `hasTools`) são calculados a partir das linhas de `agent_connections` (`ListAgentsService`, `GetAgentService`):
  - `is_tool`: o agente é filho (`connected_agent_id`) em alguma conexão;
  - `is_principal`: `!is_tool` (não é ferramenta de nenhum outro agente, tenha ou não filhos);
  - `has_tools`: o agente é pai (`agent_id`) em alguma conexão.
- **Hierarquia de um único nível:** um subagente não pode ter seus próprios subagentes (`has_tools`), e um agente que já é subagente (`is_tool`) não pode receber filhos (`CreateAgentConnectionService`).
- **Layout do canvas:** `AgentEntity.canvas_layout` (JSONB) persiste o estado visual do editor de conexões (`{ viewport: { zoom, x, y }, nodes: { [agentId]: { x, y } } }`), atualizado via `PATCH /agent/:id/canvas-layout`.
- **Quebra de ciclo na resolução de subagentes (PC-008):** quando um agente principal invoca um subagente conectado, `InvokeConnectedAgentService` injeta a porta `AGENT_RESOLVER` provida por `AgentRuntimeContractsModule` (`@Global()`, via `ModuleRef.get(ResolveAgentService, { strict: false })`) para evitar dependência circular de módulos e sem usar `forwardRef`.
</regras>

## Grafo de conhecimento do agente (`GET /agent/:id/knowledge-graph`)

<regras>
- `GetKnowledgeGraphController` (`GET /agent/:id/knowledge-graph`, permissão `agent.read`) e `GetKnowledgeGraphService` constroem o grafo de conhecimento completo do agente (`nodes`, `edges`, `stats`) combinando em paralelo (`Promise.all`):
  - o próprio agente (`type: 'agent'`);
  - suas ferramentas ativas em `agent.tools` (`type: 'tool'`);
  - os arquivos de memória no `PostgresStore` sob o namespace `['memories', agent.id, 'filesystem']` (`type: 'memory'`);
  - os arquivos de skills no `PostgresStore` sob o namespace `['skills', agent.id, 'filesystem']` (`type: 'skill'`);
  - as fontes de conhecimento indexadas em `SourceRepository.listByAgent(agent.id)` (`type: 'source'`).
- Arestas implícitas também são inferidas quando o conteúdo de uma memória ou skill menciona o nome ou caminho de outro nó.
</regras>

## Runtime de execução (`src/modules/agent-runtime/` e `src/modules/store/`)

<estrutura>
```
ResolveAgentService.execute(agentIdOrIdentifier)
  ├─ AgentRepository.findByIdOrIdentifier(agentIdOrIdentifier)
  └─ Promise.all([
       loadStoreService.execute(),                                   → PostgresStore (ou InMemoryStore em mock)
       loadCheckpointerService.execute(),                            → PostgresSaver (ou MemorySaver em mock)
       toolLoaderService.execute(agentPayload),                      → AgentTool[] (vector_search, tavily_search, subagentes)
       resolveSystemPromptService.execute(agentPayload),             → lê memories/<agent_identifier>/AGENT.md ou agent.system_prompt
       resolveMemorySourcesService.execute(agentPayload.id),         → ['/memories/...', '/scratchpad/notes.md']
       resolveSkillSourcesService.execute(agentPayload.agent_identifier), → ['/skills/<identifier>/', '/skills/shared/coding/', '/skills/shared/', '/skills/']
     ])
  └─ createDeepAgent({ model, tools, systemPrompt, memory, skills, checkpointer, store, backend: CompositeBackend })
```
</estrutura>

<regras>
- **Modelo em produção (`CHAT_MODEL_SERVICE`):** `ResolveAgentService` instancia o modelo via `IChatModelService.createModel` (`ChatAnthropic`, modelo padrão `deepseek-chat-v3.2` em `ResolveAgentService` através do endpoint configurável em `ANTHROPIC_BASE_URL`).
- **Resolução do System Prompt (`ResolveSystemPromptService`):** se `agent.agent_identifier` estiver preenchido, tenta ler `memories/<agent_identifier>/AGENT.md` do disco (`process.cwd()`); se o arquivo existir e não estiver vazio, usa seu conteúdo; caso contrário, usa `agent.system_prompt` do banco.
- **Deep Agents com `CompositeBackend` e `PostgresStore`:** `ResolveAgentService` instancia o agente com `createDeepAgent` (`deepagents`), montando um `CompositeBackend` com `StateBackend` efêmero na raiz e três rotas persistidas no `PostgresStore` (`@langchain/langgraph-checkpoint-postgres/store`, ou `InMemoryStore` quando `INTEGRATION_MODE === 'mock'`):
  - `/memories/` → `StoreBackend` com namespace `['memories', agentPayload.id, 'filesystem']`;
  - `/skills/` → `StoreBackend` com namespace `['skills', agentPayload.id, 'filesystem']`;
  - `/scratchpad/` → `StoreBackend` com namespace `['scratchpad', agentPayload.id, 'filesystem']`.
- **Fontes de memória e skills no VFS:**
  - `ResolveMemorySourcesService` busca no `PostgresStore` (`['memories', agentId, 'filesystem']`) todas as chaves `.md` (exceto `/AGENT.md`), prefixa com `/memories` e adiciona `/scratchpad/notes.md`.
  - `ResolveSkillSourcesService` retorna `['/skills/<identifier>/', '/skills/shared/coding/', '/skills/shared/', '/skills/']` quando o agente possui `agent_identifier`, ou `['/skills/shared/coding/', '/skills/shared/', '/skills/']` quando não possui.
  - O script `bun run seed:memories [agentIdentifier]` (`scripts/seed-memories.ts`) sincroniza os diretórios locais `memories/`, `skills/` e `scratchpad/` do repositório para o `PostgresStore`.
- **Checkpointer de conversação (`LoadCheckpointerService`):** usa `PostgresSaver.fromConnString(env.DATABASE_URL)` (com `.setup()`) em modo `live` e `MemorySaver` em modo `mock`.
- **`thread_id` é `conversationId ?? session.id`:** construído em `GenerateAiResponseService`. Ele vincula a conversa ao histórico de checkpoints do LangGraph; nunca altere esse formato, sob pena de desconectar todas as threads existentes.
- **Sanitização de mensagens (`sanitizeToolCallMessages`):** checkpoints interrompidos no meio de uma execução podem conter chamadas `tool_use` sem o respectivo `tool_result` (ou vice-versa), o que faz a API da Anthropic/DeepSeek rejeitar a requisição. O runtime sanitiza mensagens órfãs e o script `bun run repair:thread <threadId>` limpa checkpoints corrompidos no banco.
- **`GenerateAiResponseService` captura erros em uma desculpa em português:** falhas durante a execução do grafo são registradas no logger estruturado e convertidas em uma resposta amigável ("Desculpe, tive um problema…"), de modo que o cliente nunca receba stack traces crus. A resposta estruturada `finalAnswer` (`AgentFinalResponseSchema`) é a carga útil que se torna o evento `final` no stream NDJSON.
</regras>
