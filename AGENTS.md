# AGENTS.md

Este arquivo orquestra agentes de IA que trabalham com o código do **Sherlock AI** (`split-ai`).

## Sobre este projeto

O **Sherlock AI** (`split-ai`) é um **motor pessoal de IA**: um backend em NestJS 11 + Fastify 5 para agentes de chat, OCR, ingestão de fontes de conhecimento, síntese de voz e WhatsApp. Organizações, membros, convites, chaves de API, cobrança (Stripe, planos, créditos), widget incorporável, cadastro self-service/SMS, banco de dados externo de clientes (`execute_sql`, `CUSTOMER_DATABASE`), relatórios analíticos e a integração com o BravoHub foram removidos intencionalmente. Há **um único deploy, poucos usuários e nenhum tenant** — não reintroduza escopo de tenant, cotas ou cobrança sem uma solicitação explícita.

O pipeline de IA é construído sobre LangChain / LangGraph e Deep Agents (`deepagents`), utilizando `ChatAnthropic` (`CHAT_MODEL_SERVICE`, padrão `deepseek-chat-v3.2` via endpoint compatível com Anthropic) para chat, Voyage AI para recuperação (`voyage-3-large` de 1024 dimensões para embeddings e `rerank-2.5` como cross-encoder de reranking), armazenamento vetorial no Supabase (`pgvector`) e PostgreSQL (também no Supabase) como banco relacional via TypeORM 0.3, além de `PostgresStore` e `PostgresSaver` para memória de longo prazo (`/memories/`, `/skills/`, `/scratchpad/`) e histórico de conversação.

Ele fica em `/Users/gabrielbutkus/Documents/Projects/split-ai`, ao lado do cliente web `split-client` (`/Users/gabrielbutkus/Documents/Projects/split-client`; ambos abrem juntos via `../_workspaces/split-ai.code-workspace`).

O `split-client` (Next.js 16 na Vercel, https://split-client.vercel.app) chama esta API exclusivamente a partir do servidor (Server Components, Server Actions e Route Handlers) e espelha os contratos de requisição e resposta em `../split-client/shared/contracts/`: qualquer alteração de contrato aqui (campo, status HTTP, permissão) exige atualização correspondente lá.

## Fonte de referência para padrões de projeto

A arquitetura deste ecossistema tem como fonte de referência o repositório `/Users/gabrielbutkus/Documents/Projects/ai-agents-engineering`:

- **Padrões de Backend (NestJS + Fastify):** `/Users/gabrielbutkus/Documents/Projects/ai-agents-engineering/docs/backend/rules/` e `/Users/gabrielbutkus/Documents/Projects/ai-agents-engineering/docs/backend/CLAUDE.md`.
- **Padrões de Frontend (Next.js + ReactJS, aplicados no `split-client`):** `/Users/gabrielbutkus/Documents/Projects/ai-agents-engineering/docs/frontend/rules/` e `/Users/gabrielbutkus/Documents/Projects/ai-agents-engineering/docs/frontend/CLAUDE.md`.

As regras em `.agents/rules/` deste repositório são a especificação adaptada ao `split-ai` (TypeORM 0.3, `bun`, Jest, código em inglês com mensagens em português e escopo sem tenants). Quando precisar consultar a fundamentação de um padrão de projeto ou desenhar uma nova estrutura, use `/Users/gabrielbutkus/Documents/Projects/ai-agents-engineering` como referência.

## Idioma: Documentação em Português × Código em Inglês

- **Documentação em português:** toda a documentação (`AGENTS.md`, `README.md`, `.agents/rules/`, `.agents/skills/`, `.agents/workflows/`) é mantida em português, padronizada com o `split-client`.
- **Código-fonte em inglês:** todo o código gerado neste repositório (nomes de pastas, arquivos, classes, interfaces, tipos, métodos, funções, variáveis, propriedades, colunas de banco de dados, rotas HTTP, chaves de permissão, tokens de DI e nomes de eventos de log) **deve ser escrito em inglês**.
- **Textos voltados ao usuário e ao LLM em português:** mensagens de exceções HTTP (`NotFoundException('Agente não encontrado')`), mensagens de validação de DTOs, descrições do Swagger e textos de prompts/descrições de ferramentas para o LLM são escritos em português.

## Orquestração da documentação (`.agents/rules/`, `.agents/skills/` e `.agents/workflows/`)

As regras em `.agents/rules/` são numeradas e possuem carregamento automático (`always_on` para `00`, `01` e `12`; `glob` por caminho de arquivo para `02` a `11`). Cada tema tem um único arquivo dono:

| Arquivo                                          | Responsabilidade                                                                                                                                                                                                           | Gatilho (`globs`)                                                                                                                                    |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.agents/rules/00-projeto.md`                    | Estado do projeto, referência a `ai-agents-engineering`, desvios conscientes, comandos, arquitetura, deploy e índice                                                                                                       | `always_on`                                                                                                                                          |
| `.agents/rules/01-topologia-e-convencoes.md`     | Topologia de `src/`, ordem de boot do `main.ts`, `env.ts`, fronteiras entre domínios, abstração, idioma, nomenclatura, zero comentários e tipagem                                                                          | `always_on`                                                                                                                                          |
| `.agents/rules/02-modulos-e-injecao.md`          | Os três papéis de `*.module.ts`, agregadores de domínio, `@Global()`, escolha do mecanismo de DI e portas                                                                                                                  | `src/**/*.module.ts, src/**/contracts/**, src/**/*.port.ts`                                                                                          |
| `.agents/rules/03-casos-de-uso.md`               | Fluxo de requisição, regras de controller (`handle`), service (`execute`) e DTO (`class-validator`), receita de caso de uso                                                                                                | `src/**/*.controller.ts, src/**/*.service.ts, src/**/*.dto.ts`                                                                                       |
| `.agents/rules/04-banco-de-dados.md`             | Entidades em `schema/`, soft delete, UTC em timestamps, repositórios, projeção/listagem, transações e migrations                                                                                                           | `src/infrastructure/database/**, src/**/repositories/**`                                                                                             |
| `.agents/rules/05-transversais.md`               | Quando criar mecanismo global, `GlobalExceptionFilter`, `ErrorResponse`, tabela de exceções, decoradores, correlação, logs e health                                                                                        | `src/shared/http/**, src/shared/decorators/**, src/shared/observability/**`                                                                          |
| `.agents/rules/06-autenticacao-e-autorizacao.md` | Guards globais, `TokenVerifier`, `AuthenticatedUser`, catálogo de permissões por papel e ausência de escopo de recurso                                                                                                     | `src/auth/**, src/modules/auth-flows/**, src/shared/decorators/**, src/types/**`                                                                     |
| `.agents/rules/07-integracoes-externas.md`       | Provedores em `src/infrastructure/providers/`, tokens, modo mock, `ResilientClient` e checklist de novo provedor                                                                                                           | `src/infrastructure/**`                                                                                                                              |
| `.agents/rules/08-agentes-de-ia.md`              | Configuração e runtime de agentes: `system_prompt`, dual-key lookup, conexões e canvas, grafo de conhecimento, `ResolveAgent`, Deep Agents (`CompositeBackend` / `PostgresStore` / `PostgresSaver`) e `GenerateAiResponse` | `src/modules/agents/**, src/modules/agent-connections/**, src/modules/agent-runtime/**, src/modules/store/**, memories/**, skills/**, scratchpad/**` |
| `.agents/rules/09-ferramentas-e-rag.md`          | `ToolLoaderService`, `vector_search`, `tavily_search`, busca por limiar com `VoyageRerankCompressor`, ingestão assíncrona (`202`) e metadados `agent_id` + `source_id`                                                     | `src/modules/tools/**, src/modules/retrieval/**, src/modules/sources/**, src/infrastructure/providers/{voyage,supabase,spider,tavily}.provider.ts`   |
| `.agents/rules/10-chat-e-streaming.md`           | `POST /chat/:agentId`, hijack do socket Fastify para NDJSON, sessões de 8h e persistência de mensagens                                                                                                                     | `src/modules/chat/**, src/modules/sessions/**`                                                                                                       |
| `.agents/rules/11-testes.md`                     | Camadas unitária e e2e, harness `createTestApp()`, banco de teste e critérios de qualidade                                                                                                                                 | `test/**, src/**/*.spec.ts`                                                                                                                          |
| `.agents/rules/12-problemas-conhecidos.md`       | Ordem de contorno e catálogo `PC-001` a `PC-020` de travas de bibliotecas                                                                                                                                                  | `always_on`                                                                                                                                          |

### Skills e Workflows (`.agents/skills/<nome>/SKILL.md` e `.agents/workflows/<nome>.md`)

| Skill / Workflow                 | Quando acionar                                                                                                                                                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `nova-funcionalidade`            | **Antes de implementar qualquer funcionalidade nova, endpoint, caso de uso, tabela ou integração.** Contém as 18 perguntas de análise, o formato obrigatório de plano, a ordem de implementação e o checklist de encerramento. |
| `problema-conhecido`             | **Antes de investigar um erro ou limitação de biblioteca** e ao concluir uma investigação não trivial para registrar em `12-problemas-conhecidos.md`.                                                                          |
| `fluxo-de-raciocinio`            | Exemplos práticos (antes/depois) de projeção no banco (`fields`), tipagem com `Pick<>`, paralelismo (`Promise.all`) e eliminação de checagens redundantes.                                                                     |
| `ciclo-de-vida-do-agente`        | Visão ponta a ponta do pipeline de IA (criação → ingestão → `/chat/:agentId` → `ResolveAgent` → `GenerateAiResponse` → tools → persistência).                                                                                  |
| `configuracao-de-agentes`        | CRUD de agentes, `system_prompt`, `tools`, `response_format`, `agent_connections`, `canvas_layout` e `GET /agent/:id/knowledge-graph`.                                                                                         |
| `execucao-de-agentes`            | Runtime `ResolveAgentService`, `GenerateAiResponseService`, `createDeepAgent`, `CompositeBackend`, `PostgresStore`, `PostgresSaver`, `thread_id` e LangSmith.                                                                  |
| `ferramentas-e-rag`              | `ToolLoaderService`, `vector_search`, `tavily_search`, `VoyageRerankCompressor` e ingestão assíncrona de fontes (`POST /agent/generate-source`).                                                                               |
| `fluxo-de-chat`                  | Streaming NDJSON em `POST /chat/:agentId`, hijack do Fastify, sessões de 8h e `RecordChatMessageService`.                                                                                                                      |
| `stack-tecnologica`              | Inventário de provedores externos, tokens de DI, tabelas e variáveis de ambiente (`env.ts`).                                                                                                                                   |
| `integracao-langchain-anthropic` | Configuração e uso do `ChatAnthropic` (`CHAT_MODEL_SERVICE`), `ANTHROPIC_BASE_URL` (Anthropic/DeepSeek), prompt caching e citações.                                                                                            |
| `eleven-labs`                    | Referência específica para a implementação ElevenLabs do `TEXT_TO_SPEECH_SERVICE` (`TTS_PROVIDER=elevenlabs`).                                                                                                                 |

**Regra inegociável: manter a documentação de _agent-driven development_ atualizada.** Sempre que uma tarefa criar, alterar ou remover endpoint, caso de uso, entidade, integração, contrato, convenção ou comportamento arquitetural relevante, atualize no mesmo trabalho toda a documentação de agentes afetada (`AGENTS.md`, `.agents/rules/`, `.agents/skills/` e `.agents/workflows/`), mantendo `.agents/skills/<nome>/SKILL.md` e `.agents/workflows/<nome>.md` sincronizados. Tarefa com documentação de agentes desatualizada está incompleta.

## Desvios conscientes do conjunto original de regras (`ai-agents-engineering`)

| Tópico                                         | Especificação base (`ai-agents-engineering`) | Decisão no `split-ai`                                                                           | Motivo                                                                                |
| ---------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| ORM                                            | Drizzle + `pg`                               | **TypeORM 0.3**, `EntityManager` como `tx`, `migration:generate`                                | Entidades e `PostgresSaver` já utilizavam `pg`/TypeORM; reescrita descartada          |
| Gerenciador de pacotes                         | `pnpm`                                       | **`bun`** (`bun.lock`, Dockerfile, CI)                                                          | Padronizado no repositório                                                            |
| Testes                                         | Vitest + Testcontainers                      | **Jest** (`ts-jest`); e2e contra `TEST_DATABASE_URL`, Testcontainers apenas como fallback local | Suíte existente e rápida na CI                                                        |
| Identidade                                     | Resource Server, IdP externo                 | Esta aplicação **emite** JWTs HS256 em `POST /auth/login` (PC-001)                              | Sem IdP externo para um motor pessoal                                                 |
| Identificadores no código                      | Idioma do domínio                            | Código em **inglês**; mensagens de erro/validação, Swagger e prompts em **português**           | 400+ arquivos e contratos existentes                                                  |
| Prefixo global                                 | `app.setGlobalPrefix(env.API_PREFIX)`        | **Nenhum**                                                                                      | Health checks e clientes dependem dos caminhos atuais                                 |
| Permissões                                     | Tabelas `roles`/`permissions`                | **Derivadas do papel (`role`)** em `src/auth/permissions.ts`                                    | Sem necessidade de concessões individuais por usuário                                 |
| Escopo de recurso                              | `AccessScopeService`                         | **Não implementado**: sem tenants, `admin` e `user` atuam sobre tudo                            | Veja `06-autenticacao-e-autorizacao.md`                                               |
| Trilha de auditoria                            | `@AcaoAuditoria` + `audit_logs`              | **Não implementado**                                                                            | Não exigido pelo escopo atual                                                         |
| Padrão de `INTEGRATION_MODE`                   | `mock`                                       | `mock` apenas quando `NODE_ENV=test`, `live` caso contrário                                     | Arquivos `.env` locais contêm chaves reais                                            |
| `ResilientClient` em todo lugar                | Toda chamada externa                         | Apenas HTTP manual (reranker Voyage); SDKs mantêm sua própria pilha (PC-013)                    | SDKs encapsulam autenticação, streaming e webhooks                                    |
| `isolatedModules` / `noUncheckedIndexedAccess` | Ativado                                      | **Desativado** em `tsconfig.json` (PC-014)                                                      | Conflito entre `isolatedModules`, `emitDecoratorMetadata` e `consistent-type-imports` |
| Migration baseline                             | Obrigatória                                  | **Nenhuma**; as migrations são deltas sobre o schema de produção (PC-017)                       | O schema de produção antecede o histórico de migrations                               |

## Comandos

Gerenciador de pacotes: **bun** (`bun.lock`, Dockerfile, CI).

```bash
bun install                                 # instala dependências
bun run start:dev                           # modo watch (porta padrão 4000)
bun run start:prod                          # executa dist/main compilado
bun run build                               # nest build → dist/
bun run lint                                # eslint + lint:comments (somente checagem; a CI executa isso)
bun run lint:fix                            # eslint --fix
bun run lint:comments --fix                 # remove comentários sob src/
bun run typecheck                           # tsc --noEmit
bun run format:check                        # prettier --check
bun run test                                # jest (specs unitárias + funções puras sob src/)
TEST_DATABASE_URL=postgres://postgres@127.0.0.1:5432/split_ai_test bun run test:e2e   # e2e (precisa de Postgres)
bun run test:cov                            # cobertura
bun jest src/path/to/file.spec.ts           # arquivo único
bun jest -t "fragmento do nome do teste"    # teste único por nome
bun run di:verify && bun run di:boot-check  # cabeamento de módulos: alcançabilidade estática + container Nest real (DataSource simulado)
bun run db:generate src/infrastructure/database/migrations/<timestamp>-<name>   # contra um banco espelhando produção
bun run db:check | db:migrate | db:revert | db:show
bun run seed:memories [agentIdentifier]     # sincroniza memories/, skills/ e scratchpad/ locais para o PostgresStore
bun run repair:thread <threadId>            # remove uma thread com checkpoint corrompido do LangGraph
docker compose up                           # api + Redis local + Postgres (para e2e)
```

## Arquitetura em uma tela

```
src/
  main.ts                    Bootstrap do Fastify (createFastifyAdapter, pipe global, pino, Swagger)
  app.module.ts              Raiz — AppLoggerModule, TypeOrmModule.forRootAsync(ENTITIES, MIGRATIONS),
                             InfrastructureModule, AuthModule, HealthModule, um módulo agregador por domínio
  auth/                      Guards globais, TokenVerifier, PrincipalResolverService, permissions.ts, request-user.ts
  infrastructure/
    database/schema/         Entidades TypeORM + barrel exportando ENTITIES (único lugar onde tabelas são declaradas)
    database/migrations/     MIGRATIONS (executadas pelo job `migrate` na CI, nunca no boot); data-source.ts para o CLI
    database/utc-timestamps.ts useUtcForTimestampColumns (força leitura/escrita UTC em colunas timestamp)
    database/transaction-executor/   TransactionExecutor.run(async (tx) => …)
    infrastructure.module.ts @Global() — agrega e publica todos os provedores e clientes externos abaixo
    infrastructure.health.ts Estado por dependência externa (READY | NOT_CONFIGURED | MOCK) reportado por /health/ready
    http-client/             ResilientClient (timeout, retry+backoff, circuit breaker, proteção SSRF, correlação)
    providers/               Provedores de serviços externos (<name>.provider.ts):
                             anthropic, voyage, supabase, twilio, spider, tavily, google-vision, gcp-storage, text-to-speech.
                             Exportam tokens, interfaces, factories de client/service e fallbacks mock (INTEGRATION_MODE=mock)
  modules/<domain>/          agents, agent-connections, agent-runtime, auth-flows, chat, retrieval,
                             sessions, sources, store, tools, users, voice, whatsapp
    <domain>.module.ts       Agregador: importa + exporta os módulos de casos de uso, nada além disso
    <use-case>/              Um caso de uso = um módulo = um controller = um endpoint (arquivos kebab-case)
    repositories/            <name>.repository.ts + <name>.repository.module.ts (forFeature + provides/exports)
    contracts/               Portas publicadas para outros domínios, quando necessário
  shared/
    config/env.ts            Objeto `env` congelado e validado com Zod — o ÚNICO lugar que lê process.env
    contracts/               Tipos TS compartilhados + barrel, ErrorResponse, paginação (PageRequest/PageResult/toPaginatedResponse)
    decorators/              @Public, @RequirePermissions, @User (importado como AuthUser)
    http/                    Factory do adaptador Fastify, pipe de validação, filtro de exceções, error mapper, pagination.dto, health/
    observability/           Correlação (AsyncLocalStorage), módulo de logger pino, inicialização do Sentry
    utils/                   Funções utilitárias puras, kebab-case
memories/                    Prompts e memórias de agentes versionados (ex.: memories/<identifier>/AGENT.md)
skills/                      Skills de agentes para o StoreBackend (skills/<identifier>/, skills/shared/)
scratchpad/                  Notas de rascunho iniciais (scratchpad/notes.md)
scripts/                     refactor-di/, lint/no-comments.ts, test/prepare-database.ts, seed-memories.ts, repair-thread-checkpoint.ts
test/                        e2e por domínio + support/ (test-app, factories, database) + global-setup
```

## Resumo das invariantes principais

- **Autenticação e permissões (`06-autenticacao-e-autorizacao.md`):** `AuthenticatedUser` é `{ id, name, email, phone, role, permissions }`. Roles: `admin` (tudo, incluindo `agent.manage` e `user.manage`), `user` (operador de confiança) e `guest` (`account.access` + `chat.ask`). `TokenVerifier` aceita apenas `Authorization: Bearer <HS256 JWT>` assinado com `env.JWT_SECRET`.
- **Banco de dados e projeções (`04-banco-de-dados.md`):** Soft delete (`deleted_at`) em todas as entidades; índices únicos parciais (`WHERE "deleted_at" IS NULL`); colunas `timestamp` lidas/gravadas em UTC (`useUtcForTimestampColumns`). Listagens projetam campos no `SELECT` (`fields?: readonly K[]`) e retornam `toPaginatedResponse()`.
- **Zero comentários e três casts aceitos (`01-topologia-e-convencoes.md`):** `bun run lint` falha em qualquer comentário sob `src/`. Os únicos casts aceitos são `data as QueryDeepPartialEntity<Entity>` (PC-015), `as unknown as AdapterPlugin` no Fastify (PC-016) e os tipos CJS/ESM do LangChain (PC-005, PC-012).
- **Pipeline de IA (`08-agentes-de-ia.md`, `09-ferramentas-e-rag.md`, `10-chat-e-streaming.md`):**
  - `POST /chat/:agentId` (stream NDJSON via `res.hijack()`) → `CreateSessionIfNotExistsService` (8h) → `ResolveAgentService` (`Promise.all` de `LoadStoreService`, `LoadCheckpointerService`, `ToolLoaderService`, `ResolveSystemPromptService`, `ResolveMemorySourcesService`, `ResolveSkillSourcesService` + `createDeepAgent`) → `RecordChatMessageService('user')` → `GenerateAiResponseService` (`thread_id = conversationId ?? session.id`) → `RecordChatMessageService('agent')`.
  - `CompositeBackend` monta `StateBackend` na raiz e `StoreBackend` em `/memories/` (`['memories', agentId, 'filesystem']`), `/skills/` (`['skills', agentId, 'filesystem']`) e `/scratchpad/` (`['scratchpad', agentId, 'filesystem']`).
  - `GET /agent/:id/knowledge-graph` retorna `{ nodes, edges, stats }` unificando agente, tools, memórias, skills e fontes.
  - `vector_similarity_search` fecha `agent_id` por closure no servidor e usa busca por limiar via `VoyageRerankCompressor` (`VECTOR_SEARCH_CANDIDATE_K=50`, `VECTOR_SEARCH_MIN_SCORE=0.8`, `VECTOR_SEARCH_MAX_RESULTS=10`).
  - `POST /agent/generate-source` responde `202` e indexa em background garantindo `agent_id` e `source_id` nos metadados de cada chunk.

<!-- OPENWIKI:START -->

## OpenWiki

Este repositório possui um índice de evidências gerado em `openwiki/`. Trata-se de contexto opcional sob demanda (just-in-time), e não de leitura obrigatória na inicialização.

- Não enumere, pré-carregue nem pesquise wikis no início de uma tarefa. Utilize a recuperação apenas quando o usuário solicitar, quando o comportamento de uma arquitetura ou dependência pouco familiar afetar materialmente a tarefa, ou quando a inspeção do código-fonte deixar uma incerteza importante. Pare assim que a dúvida estiver fundamentada.
- Quando essas condições se aplicarem e as ferramentas de recuperação do OpenWiki estiverem disponíveis, use `openwiki_search` para contexto sob demanda e `openwiki_read` para ler as seções completas relevantes. Se a busca retornar `workspace_required`, pergunte qual workspace listado deve ser utilizado e tente novamente com seu ID.
- Use `openwiki_list_workspaces` ou `openwiki_list_wikis` quando a própria participação no workspace precisar ser descoberta.
- Se as ferramentas de recuperação não estiverem disponíveis, leia `openwiki/quickstart.md` e siga seus links para as páginas relevantes.
- Trate o código-fonte e os testes como a fonte de verdade. Itens em aberto ou dúvidas em um resumo são lacunas de verificação, não requisitos automáticos.
- Prefira a validação mais enxuta e silenciosa que comprove o comportamento alterado. Preserve a saída completa em caso de falha.

O workflow agendado do OpenWiki no GitHub Actions atualiza a wiki do repositório. Não edite manualmente páginas geradas em `openwiki/` a menos que seja explicitamente solicitado; prefira atualizar o código-fonte e a documentação oficial para que o OpenWiki regenere.

<!-- OPENWIKI:END -->
