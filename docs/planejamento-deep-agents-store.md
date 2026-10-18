# Planejamento: Migração para Deep Agents e Store no Supabase

Este documento registra o planejamento estratégico e técnico para a modernização do engine de agentes do **Sherlock AI** e seu cliente web **split-client**.

---

## 1. Visão Geral e Motivação

O **Sherlock AI** utiliza uma abordagem baseada em `createDeepAgent` (`deepagents`) com `CompositeBackend`, `PostgresStore` no Supabase e suporte a ferramentas nativas.

### Objetivos Principais

1. **Adoção do Deep Agents (`deepagents`):**
   - Utilizar o VFS (Virtual Filesystem) com isolamento e quarentena de contexto.
   - Suporte nativo a subagentes via parâmetro `subagents: SubAgent[]` e ferramenta de orquestração `task`.
   - Streaming de eventos em subgrafos (`subgraphs: true`).
2. **Estratégia de Store no Supabase (`PostgresStore`):**
   - Utilizar o `PostgresStore` do LangGraph (`@langchain/langgraph-checkpoint-postgres/store`) diretamente no PostgreSQL do Supabase.
   - Roteamento via `CompositeBackend`:
     - `/` (raiz) no `StateBackend` (efêmero, thread-scoped no checkpointer).
     - `/memories/` e `/skills/` no `StoreBackend` persistidos no `PostgresStore`.
   - Os arquivos são armazenados no formato oficial `FileData` (`{ content, mimeType, created_at, modified_at }`) em namespaces dedicados (`['agents', agentId, 'memories']`, `['agents', agentId, 'skills']`).
   - Não há necessidade de versionar arquivos markdown estáticos no repositório: o conteúdo reside no Supabase via Store.
3. **System Prompts em Markdown Puro:**
   - Eliminação da tabela `agents_instructions`.
   - Coluna `system_prompt` (TEXT) incorporada diretamente na tabela `agents`.
   - APIs de criação e edição recebem e devolvem Markdown limpo.
4. **Remoção Completa da Feature de Database:**
   - Remoção de colunas, portas, gateways, DTOs e variáveis de ambiente relacionados a `database_tool`, `database_url`, `execute_sql` e `CUSTOMER_DATABASE`.

---

## 2. Fases de Execução

### Fase 1: Alinhamento de Dependências e Limpeza de Dead Code (Database)

- Atualização do `langsmith` no `package.json` para `>=0.7.1 <0.10.0` (peer dependency do `deepagents`).
- Remoção completa de `CUSTOMER_DATABASE`:
  - `src/infrastructure/integration/customer-database/`
  - `src/infrastructure/integration/customer-database.port.ts`
  - Registros em `integration.module.ts`, `integration.health.ts`, `env.ts` e `.env.example`.
- Remoção das ferramentas de banco em retrieval:
  - `src/modules/retrieval/load-database-tool/`
  - `src/modules/retrieval/maybe-load-database-tool/`
  - Limpeza de `load-agent-tools.service.ts` e `retrieval.module.ts`.

### Fase 2: Unificação do System Prompt em Markdown e Remoção de `agents_instructions`

- Adição de `system_prompt: text` em `AgentEntity` (`agents`).
- Remoção das colunas `database_tool`, `database_url`, `database_tables`, `database_sample_rows` em `AgentEntity`.
- Remoção da entidade `AgentInstructionEntity` e tabela `agents_instructions`.
- Criação e registro da Migration TypeORM correspondente.
- Atualização de DTOs, controllers, services e repositórios em `src/modules/agents/` (`create-agent`, `update-agent`, `get-agent`, `agent.repository`).
- Remoção de `AgentInstructionRepository` e `AgentInstructionRepositoryModule`.
- Atualização dos contratos e formulários correspondentes no `split-client`.

### Fase 3: Infraestrutura de Store no Supabase

- Criação do serviço de inicialização e injeção do `PostgresStore` (`@langchain/langgraph-checkpoint-postgres/store`).
- Configuração do `CompositeBackend` (`StateBackend` + `StoreBackend` para `/memories/` e `/skills/`).
- Definição dos namespaces hierárquicos e utilitários de serialização `createFileData`.

### Fase 4: Subagentes Nativos com Deep Agents

- Conversão da resolução de agentes conectados para objetos `SubAgent`.
- Substituição de `createAgent` por `createDeepAgent` em `ResolveAgentService`.
- Remoção de `AppendConnectionToolsService` e `InvokeConnectedAgentService`.
- Atualização do streaming em `GenerateAiResponseService` e `handleStreamResponse` para capturar eventos de subgrafos (`subgraphs: true`).

### Fase 5: Validação, Testes e Documentação

- Execução de `bun run typecheck`, `bun run lint`, `bun run di:verify && bun run di:boot-check`.
- Validação e execução de testes e2e e unitários.
- Validação de compilação e tipagem no `split-client` (`pnpm typecheck`, `pnpm lint`).
