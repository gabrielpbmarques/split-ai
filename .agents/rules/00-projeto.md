---
trigger: always_on
description: 'Contexto do split-ai (Sherlock AI): estado, referência arquitetural, desvios conscientes, comandos, stack, deploy, índice de regras e skills e como trabalhar aqui.'
---

<!-- Sincronizado com `AGENTS.md`. Ao mudar o estado do projeto, comandos, regras ou skills, atualize os dois. -->

# split-ai (Sherlock AI)

## Estado do projeto

O **Sherlock AI** (`split-ai`) é um **motor pessoal de IA**: backend em NestJS 11 + Fastify 5 para agentes de chat, OCR, ingestão de fontes de conhecimento, síntese de voz e WhatsApp. Fica em `~/Documents/Projects/split-ai`, ao lado do cliente web `split-client` (`../split-client`; ambos abrem juntos por `../_workspaces/split-ai.code-workspace`).

- **Escopo enxuto, sem multi-tenancy:** organizações, membros, convites, chaves de API, cobrança (Stripe, planos, créditos), widget incorporável, cadastro público/SMS, banco de dados externo de clientes (`execute_sql`, `CUSTOMER_DATABASE`), relatórios analíticos e a integração com o BravoHub foram removidos intencionalmente. Há **um único deploy, poucos usuários e nenhum tenant**.
- **Pipeline de IA:** construído sobre LangChain / LangGraph e Deep Agents (`deepagents`), usando `ChatAnthropic` (`CHAT_MODEL_SERVICE`, padrão `deepseek-chat-v3.2` via endpoint compatível com Anthropic), Voyage AI para recuperação (`voyage-3-large` com 1024 dimensões para embeddings e `rerank-2.5` como cross-encoder de reranking), armazenamento vetorial no Supabase (`pgvector`) e PostgreSQL (Supabase) como banco relacional via TypeORM 0.3, além de `PostgresStore` e `PostgresSaver` para memória de longo prazo (`/memories/`, `/skills/`, `/scratchpad/`) e checkpoints de thread.
- **Cliente web (`split-client`):** roda em Next.js na Vercel (https://split-client.vercel.app) e chama esta API exclusivamente a partir do servidor (Server Components, Server Actions e Route Handlers). Ele espelha os formatos de request e response em `../split-client/shared/contracts/`: qualquer mudança de contrato aqui (campo, status HTTP, permissão) exige atualização correspondente lá.

## Fonte de referência arquitetural

A arquitetura deste repositório deriva diretamente da especificação de engenharia em `/Users/gabrielbutkus/Documents/Projects/ai-agents-engineering`:

- **Backend (NestJS + Fastify):** `/Users/gabrielbutkus/Documents/Projects/ai-agents-engineering/docs/backend/rules/` e `/Users/gabrielbutkus/Documents/Projects/ai-agents-engineering/docs/backend/CLAUDE.md`.
- **Frontend (Next.js + React, usado no `split-client`):** `/Users/gabrielbutkus/Documents/Projects/ai-agents-engineering/docs/frontend/rules/` e `/Users/gabrielbutkus/Documents/Projects/ai-agents-engineering/docs/frontend/CLAUDE.md`.

As regras em `.agents/rules/` deste repositório são a adaptação local da especificação de backend para a stack do Sherlock AI (TypeORM 0.3, `bun`, Jest, código em inglês com mensagens em português e escopo sem tenants). Na ausência de detalhe local ou ao desenhar novos padrões arquiteturais, consulte `/Users/gabrielbutkus/Documents/Projects/ai-agents-engineering`.

## Desvios conscientes da especificação base

<tabela>

| Tópico                                         | Especificação base (`ai-agents-engineering`) | Decisão no `split-ai`                                                                      | Motivo                                                                                |
| ---------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| ORM                                            | Drizzle + `pg`                               | **TypeORM 0.3**, `EntityManager` como `tx`, `migration:generate`                           | Entidades e `PostgresSaver` já usavam `pg`/TypeORM; reescrita descartada              |
| Gerenciador de pacotes                         | `pnpm`                                       | **`bun`** (`bun.lock`, Dockerfile, CI)                                                     | Padronizado no repositório                                                            |
| Executor de testes                             | Vitest + Testcontainers                      | **Jest** (`ts-jest`); e2e contra `TEST_DATABASE_URL` (Testcontainers como fallback)        | Suíte existente e rápida em CI                                                        |
| Identidade                                     | Resource Server com IdP externo              | Esta aplicação **emite** JWTs HS256 em `POST /auth/login` (PC-001)                         | Motor pessoal sem IdP externo                                                         |
| Idioma do código                               | Idioma do domínio em identificadores         | **Código 100% em inglês**; mensagens de erro/validação, Swagger e prompts em **português** | 400+ arquivos e contratos existentes                                                  |
| Prefixo global da API                          | `app.setGlobalPrefix(env.API_PREFIX)`        | **Nenhum**                                                                                 | Health checks e clientes dependem das rotas na raiz                                   |
| Permissões                                     | Tabelas `roles` e `permissions`              | **Derivadas do papel (`role`)** em `src/auth/permissions.ts`                               | Motor pessoal sem grants por usuário                                                  |
| Escopo de recurso                              | `AccessScopeService`                         | **Não implementado**: sem tenants, `admin` e `user` atuam sobre todos os recursos          | Ver `06-autenticacao-e-autorizacao.md`                                                |
| Trilha de auditoria                            | `@AcaoAuditoria` + `audit_logs`              | **Não implementado**                                                                       | Não exigido pelo escopo atual                                                         |
| Padrão de `INTEGRATION_MODE`                   | `mock`                                       | `mock` apenas quando `NODE_ENV=test`; `live` nos demais ambientes                          | `.env` local usa credenciais reais                                                    |
| `ResilientClient`                              | Toda chamada externa                         | Apenas HTTP manual (reranker Voyage); SDKs mantêm sua própria pilha (PC-013)               | SDKs encapsulam auth, streaming e webhook                                             |
| `isolatedModules` / `noUncheckedIndexedAccess` | Ativados                                     | **Desativados** em `tsconfig.json` (PC-014)                                                | Conflito entre `isolatedModules`, `emitDecoratorMetadata` e `consistent-type-imports` |
| Migration baseline                             | Obrigatória                                  | **Nenhuma**; migrations são deltas sobre o schema de produção (PC-017)                     | Schema de produção antecede o histórico de migrations                                 |

</tabela>

## Comandos

Gerenciador de pacotes: **bun** (`bun.lock`, Dockerfile e CI).

- `bun install`: instala dependências mantendo o `bun.lock` íntegro.
- `bun run start:dev`: servidor em modo watch na porta padrão **4000** (`PORT` em `src/shared/config/env.ts`).
- `bun run start:prod`: executa `dist/main` compilado.
- `bun run build`: `nest build` → `dist/`.
- `bun run format:check`: `prettier --check`.
- `bun run lint`: `eslint` + `scripts/lint/no-comments.ts` (somente checagem, sem `--fix`).
- `bun run lint:fix`: `eslint --fix`.
- `bun run lint:comments --fix`: remove comentários sob `src/`.
- `bun run typecheck`: `tsc --noEmit`.
- `bun run test`: specs unitárias (`src/**/*.spec.ts`). Arquivo único: `bun jest src/caminho/arquivo.spec.ts`; por nome: `bun jest -t "trecho"`.
- `TEST_DATABASE_URL=postgres://postgres@127.0.0.1:5432/split_ai_test bun run test:e2e`: suíte e2e em série (`--runInBand`).
- `bun run di:verify && bun run di:boot-check`: verifica alcançabilidade estática do grafo de DI e sobe o container Nest real com `DataSource` simulado.
- `bun run db:generate src/infrastructure/database/migrations/<timestamp>-<name>`: gera migration comparando entidades com um banco espelho de produção.
- `bun run db:check | db:migrate | db:revert | db:show`: comandos do CLI do TypeORM (via `ts-node`/CommonJS, PC-006).
- `bun run seed:memories [agentIdentifier]`: sincroniza arquivos locais de `memories/`, `skills/` e `scratchpad/` para o `PostgresStore` dos agentes no banco.
- `bun run repair:thread <threadId>`: limpa checkpoints corrompidos de uma thread do LangGraph.

Antes de concluir qualquer tarefa, execute `bun run format:check`, `bun run lint`, `bun run typecheck`, `bun run test`, `bun run build` e (se alterou módulo, rota, banco ou token) `bun run di:verify && bun run di:boot-check` e `bun run test:e2e`.

## Arquitetura em uma tela

<estrutura>
```
src/
  main.ts                    Bootstrap do Fastify (createFastifyAdapter, pipe global, pino, Swagger)
  app.module.ts              Raiz — AppLoggerModule, TypeOrmModule.forRootAsync(ENTITIES, MIGRATIONS),
                             InfrastructureModule, AuthModule, HealthModule e módulos agregadores de domínio
  auth/                      Guards globais (AuthenticationGuard, AuthorizationGuard), TokenVerifier,
                             PrincipalResolverService, permissions.ts, request-user.ts
  infrastructure/
    database/
      schema/                Entidades TypeORM + index.ts exportando ENTITIES (único lugar que declara tabelas)
      migrations/            MIGRATIONS + index.ts (executadas pelo job `migrate` na CI, nunca no boot)
      transaction-executor/  TransactionExecutor.run(async (tx) => …)
      data-source.ts         DataSource para o CLI do TypeORM (ts-node/CommonJS, PC-006)
      utc-timestamps.ts      useUtcForTimestampColumns (força leitura/escrita UTC em colunas timestamp)
    http-client/             ResilientClient (timeout, retry+backoff, circuit breaker, SSRF guard, x-request-id)
    providers/               Provedores externos (<name>.provider.ts): anthropic, voyage, supabase, twilio,
                             gcp-storage, text-to-speech, google-vision, spider, tavily
    infrastructure.module.ts @Global() — agrega e exporta todos os provedores externos
    infrastructure.health.ts Estado por integração (READY | NOT_CONFIGURED | MOCK) para /health/ready
  modules/<domain>/          agents, agent-connections, agent-runtime, auth-flows, chat, retrieval,
                             sessions, sources, store, tools, users, voice, whatsapp
    <domain>.module.ts       Agregador do domínio: apenas imports e exports dos módulos de casos de uso
    <use-case>/              Um caso de uso = um módulo = um controller = um service (+ DTO quando aplicável)
    repositories/            <name>.repository.ts + <name>.repository.module.ts (TypeOrmModule.forFeature)
    contracts/               Portas entre domínios (Symbol + interface), quando necessário
  shared/
    config/env.ts            Objeto `env` congelado e validado com Zod — ÚNICO leitor de process.env
    contracts/               Modelos compartilhados, ErrorResponse, paginação (PageRequest/PageResult)
    decorators/              @Public(), @RequirePermissions(), @User() (importado como AuthUser)
    http/                    Adaptador Fastify, ValidationPipe, GlobalExceptionFilter, error-mapper, health/
    observability/           Correlação (AsyncLocalStorage), AppLoggerModule (pino), Sentry
    utils/                   Funções puras utilitárias (kebab-case, uma função por arquivo)
memories/                    Prompts e memórias de agentes versionados (ex.: memories/<identifier>/AGENT.md)
skills/                      Skills de agentes para o StoreBackend (skills/<identifier>/, skills/shared/)
scratchpad/                  Notas iniciais de rascunho dos agentes (scratchpad/notes.md)
scripts/                     refactor-di/, lint/no-comments.ts, test/prepare-database.ts, seed-memories.ts, repair-thread-checkpoint.ts
test/                        Specs e2e por domínio (*.e2e-spec.ts) + support/ (test-app, factories, database)
```
</estrutura>

## Deploy e CI

- **Produção:** Railway em https://split-ai-production-4200.up.railway.app (`/health/live` público). O Railway faz build e deploy automático a partir da branch `main` cerca de um minuto após o merge. O Railway injeta `$PORT` dinamicamente.
- **CI (`.github/workflows/ci-cd.yml`):** PRs rodam `format:check`, `lint`, `typecheck`, `test`, `test:e2e` (container `postgres:16-alpine`) e `build`. Pushes na `main` rodam a CI e, em seguida, o job `migrate` (`bun run db:migrate` com concorrência 1).
- **`secrets.DATABASE_URL` no GitHub Actions:** deve usar a URL do **session pooler** do Supabase (`aws-0-<region>.pooler.supabase.com:5432`, usuário `postgres.<project-ref>`). O host direto é exclusivo IPv6 (falha com `ENETUNREACH` nos runners) e o transaction pooler (porta `6543`) quebra `CREATE INDEX CONCURRENTLY`.

## Regras do projeto

As regras ficam em `.agents/rules/`. As três primeiras (`00`, `01` e `12`) estão sempre ativas (`trigger: always_on`); as demais (`02` a `11`) usam `trigger: glob` e entram automaticamente quando você edita arquivos daquela camada. Cada tema tem um único arquivo dono.

<tabela>

| Arquivo                            | Cobre                                                                                                                                                                                                                      |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `00-projeto.md`                    | Estado do projeto, referência a `ai-agents-engineering`, desvios conscientes, comandos, arquitetura, deploy e índice                                                                                                       |
| `01-topologia-e-convencoes.md`     | Topologia de `src/`, ordem de boot do `main.ts`, `env.ts`, fronteiras entre domínios, abstração, **idioma (código em inglês, mensagens em português)**, nomenclatura, zero comentários e tipagem                           |
| `02-modulos-e-injecao.md`          | Os três papéis de `*.module.ts`, agregadores de domínio, `@Global()`, escolha do mecanismo de injeção e portas                                                                                                             |
| `03-casos-de-uso.md`               | Fluxo de requisição, regras de controller (`handle`), service (`execute`) e DTO (`class-validator`), receita de caso de uso                                                                                                |
| `04-banco-de-dados.md`             | Entidades TypeORM em `schema/`, soft delete, UTC em timestamps, repositórios, projeção/listagem, transações e migrations                                                                                                   |
| `05-transversais.md`               | Quando criar mecanismo global, `GlobalExceptionFilter`, `ErrorResponse`, tabela de exceções, decoradores, correlação, logs e health                                                                                        |
| `06-autenticacao-e-autorizacao.md` | Guards globais, `TokenVerifier`, `AuthenticatedUser`, catálogo de permissões por papel e ausência de escopo por tenant                                                                                                     |
| `07-integracoes-externas.md`       | Provedores em `src/infrastructure/providers/`, tokens, modo mock, `ResilientClient` e checklist de novo provedor                                                                                                           |
| `08-agentes-de-ia.md`              | Configuração e runtime de agentes: `system_prompt`, dual-key lookup, conexões e canvas, grafo de conhecimento, `ResolveAgent`, Deep Agents (`CompositeBackend` / `PostgresStore` / `PostgresSaver`) e `GenerateAiResponse` |
| `09-ferramentas-e-rag.md`          | `ToolLoaderService`, `vector_search`, `tavily_search`, busca por limiar com `VoyageRerankCompressor`, ingestão assíncrona (`202`) e metadados `agent_id` + `source_id`                                                     |
| `10-chat-e-streaming.md`           | `POST /chat/:agentId`, hijack do socket Fastify para NDJSON, sessões de 8h, persistência de mensagens e sanitização de `tool_use`                                                                                          |
| `11-testes.md`                     | Camadas unitária e e2e, harness `createTestApp()`, banco de teste e critérios de qualidade de testes                                                                                                                       |
| `12-problemas-conhecidos.md`       | Ordem de contorno e catálogo `PC-001` a `PC-019` de travas de bibliotecas e decisões técnicas                                                                                                                              |

</tabela>

## Skills do projeto

Ficam em `.agents/skills/<nome>/SKILL.md`, com cópia em `.agents/workflows/<nome>.md`; invoque com `/<nome>`.

<tabela>

| Skill                            | Use quando                                                                                                                                                                        |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `nova-funcionalidade`            | Implementar ou alterar funcionalidade, endpoint, caso de uso, tabela ou integração. Exige responder às perguntas de análise e aprovar o plano antes do código.                    |
| `problema-conhecido`             | Encontrar erro inesperado, comportamento estranho ou limitação de biblioteca (consultar `12-problemas-conhecidos.md` antes de investigar e registrar o desfecho depois).          |
| `fluxo-de-raciocinio`            | Consultar exemplos práticos (antes/depois) de projeção no banco, tipagem explícita com `Pick<>`, paralelismo e eliminação de checagens redundantes em services.                   |
| `ciclo-de-vida-do-agente`        | Entender ou alterar fluxos que atravessam várias etapas do pipeline de IA (criação → ingestão → `/chat/:agentId` → `ResolveAgent` → `GenerateAiResponse` → tools → persistência). |
| `configuracao-de-agentes`        | Trabalhar no CRUD de agentes, `system_prompt`, `tools`, `response_format`, conexões entre agentes ou grafo de conhecimento.                                                       |
| `execucao-de-agentes`            | Trabalhar no runtime de execução (`ResolveAgent`, `GenerateAiResponse`, `createDeepAgent`, `CompositeBackend`, `PostgresStore`, `PostgresSaver`, `thread_id`, LangSmith).         |
| `ferramentas-e-rag`              | Trabalhar em ferramentas de agentes (`ToolLoaderService`, `vector_search`, `tavily_search`), busca vetorial no Supabase/pgvector, reranking Voyage ou ingestão de fontes.         |
| `fluxo-de-chat`                  | Trabalhar no streaming NDJSON de `POST /chat/:agentId`, hijack do Fastify, sessões de conversa ou gravação de mensagens.                                                          |
| `stack-tecnologica`              | Consultar referência rápida de provedores externos, variáveis de ambiente (`env.ts`) e configuração de infraestrutura.                                                            |
| `integracao-langchain-anthropic` | Configurar ou ajustar `ChatAnthropic` (`CHAT_MODEL_SERVICE`), prompt caching, citações ou parâmetros do modelo.                                                                   |
| `eleven-labs`                    | Trabalhar especificamente na integração ElevenLabs do `TEXT_TO_SPEECH_SERVICE` (`TTS_PROVIDER=elevenlabs`).                                                                       |

</tabela>

## Como trabalhar aqui

<regra critica="true">
Regra inegociável: sempre que uma tarefa criar, alterar ou remover endpoint, caso de uso, entidade, integração, contrato, convenção ou comportamento arquitetural relevante, atualize no mesmo trabalho toda a documentação de *agent-driven development* afetada (`AGENTS.md`, `.agents/rules/`, `.agents/skills/` e `.agents/workflows/`), mantendo `.agents/skills/<nome>/SKILL.md` e `.agents/workflows/<nome>.md` sincronizados. Tarefa com documentação de agentes desatualizada está incompleta.
</regra>

- **Documentação em português, código em inglês:** toda a documentação do repositório é escrita em português, mas todo o código gerado (pastas, arquivos, classes, métodos, variáveis, propriedades, colunas de banco, tokens de DI e nomes de eventos de log) deve ser em **inglês** (ver `01-topologia-e-convencoes.md`).
- **Ajuste pontual em um arquivo:** aplique as regras diretamente, sem plano formal.
- **Funcionalidade nova ou mudança que atravessa módulos/contratos:** siga a skill `nova-funcionalidade`.
- **Erro de biblioteca ou comportamento inesperado:** consulte `12-problemas-conhecidos.md` e siga a skill `problema-conhecido`.
- **Ordem de precedência:** pedido explícito do solicitante → `.agents/rules/` → `/Users/gabrielbutkus/Documents/Projects/ai-agents-engineering/docs/backend/rules/` → convenções do código existente.
- Leia os arquivos reais antes de afirmar algo sobre eles. Quando faltar informação na demanda (contrato, regra de negócio, permissão), pergunte ao solicitante em vez de supor.
