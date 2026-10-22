# AGENTS.md

Este arquivo fornece orientações para agentes de IA que trabalham com o código deste repositório.

## Sobre este projeto

O **Sherlock AI** é um **motor pessoal de IA**: um backend em NestJS 11 + Fastify 5 para agentes de chat, OCR, ingestão de fontes, voz e WhatsApp. Ele costumava ser um produto comercial multi-tenant; organizações, membros, chaves de API, cobrança (Stripe, planos, créditos), o widget incorporável, cadastro self-service/login por SMS e a integração com o BravoHub foram removidos intencionalmente. Há **um único deploy, um punhado de usuários e nenhum tenant** — não reintroduza escopo de tenant, cotas ou cobrança sem uma solicitação explícita.

O pipeline de IA é construído sobre LangChain / LangGraph com modelos Anthropic Claude para chat e Voyage AI para recuperação (retrieval) — `voyage-3-large` (1024 dimensões) para embeddings e `rerank-2.5` como reranker cross-encoder; armazenamento vetorial no Supabase/pgvector e PostgreSQL (também no Supabase) como banco de dados principal via TypeORM.

Ele fica em `~/Documents/Projects/split-ai`, ao lado do seu cliente web `split-client` (`../split-client`; ambos abrem juntos via `../_workspaces/split-ai.code-workspace`). É independente dos produtos BravoHub: sem banco de dados compartilhado, sem contrato de autenticação compartilhado.

O `split-client` (Next.js na Vercel, https://split-client.vercel.app) chama esta API apenas a partir do seu próprio servidor (Server Components, Server Actions e route handlers), portanto o CORS do navegador nunca se aplica a ele. Ele espelha os formatos de requisição e resposta em `../split-client/shared/contracts/`: uma alteração de contrato aqui (campo, status code, permissão) exige a alteração correspondente lá.

## A especificação: `.claude/rules/` e `.claude/skills/`

A arquitetura deste repositório é o conjunto de regras de backend escrito originalmente em `gabrielpbmarques/ai-agents-engineering` (`docs/backend/rules/`), **traduzido para o inglês e adaptado para este repositório** (TypeORM, bun, Jest, identificadores em inglês, sem tenants). A cópia adaptada é a fonte da verdade; você não precisa do repositório irmão.

| Onde                                                                                     | Responsabilidade                                                                                                           | Carrega                                                                  |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `.claude/rules/topology.md`                                                              | Estrutura de `src/`, ordem de boot do `main.ts`, `env.ts`, imports, ferramentas, checklist de verificação                  | `main.ts`, `app.module.ts`, `shared/config/**`, arquivos de configuração |
| `.claude/rules/conventions.md`                                                           | Domínio vs. caso de uso, fronteiras, abstração, idioma, nomenclatura, comentários, tipagem                                 | Qualquer `src/**/*.ts`                                                   |
| `.claude/rules/nest-modules.md`                                                          | Os três papéis de módulos, agregadores, `@Global()`, escolha de mecanismo de DI, portas                                    | `*.module.ts`, `*.port.ts`, `contracts/**`                               |
| `.claude/rules/use-cases.md`                                                             | Fluxo de requisição, regras de controller / service / DTO, receita de caso de uso                                          | `*.controller.ts`, `*.service.ts`, `*.dto.ts`                            |
| `.claude/rules/database.md`                                                              | Entidades, soft delete, repositórios, projeção/listagem, transações, migrações                                             | `infrastructure/database/**`, `repositories/**`                          |
| `.claude/rules/cross-cutting.md`                                                         | Filtro de exceção, `ErrorResponse`, tabela de exceções, decoradores, correlação, logging, health                           | `shared/http/**`, `shared/decorators/**`, `shared/observability/**`      |
| `.claude/rules/auth.md`                                                                  | Guards, `TokenVerifier`, catálogo de permissões, por que não há escopo de recurso                                          | `auth/**`, `auth-flows/**`                                               |
| `.claude/rules/integrations.md`                                                          | Provedores externos, tokens, serviços, modo mock, `ResilientClient`                                                        | `infrastructure/providers/**`                                            |
| `.claude/rules/tests.md`                                                                 | Camadas unitária vs. e2e, harness, o que é um bom teste                                                                    | `test/**`, `*.spec.ts`                                                   |
| `.claude/rules/ai-agent.md`, `agent-tools.md`, `aichat-streaming.md`, `rag-ingestion.md` | Invariantes do pipeline de IA                                                                                              | Seus caminhos de módulo                                                  |
| skill `new-feature-flow`                                                                 | **Como implementar uma funcionalidade**: 18 perguntas, formato de plano, ordem de implementação, checklist de encerramento | Sob demanda                                                              |
| skill `known-problems`                                                                   | Protocolo e template para o registro `PC-NNN` em `docs/problemas-conhecidos.md`                                            | Sob demanda                                                              |

**Nova funcionalidade = `new-feature-flow` primeiro.** Responda às suas perguntas, escreva o plano no seu formato, mostre-o ao solicitante e, em seguida, implemente na sua ordem (schema → tipos → módulos → casos de uso → testes → documentação → verificação). O arquivo `.github/pull_request_template.md` contém o seu checklist de encerramento.

**Encontrou um erro ou peculiaridade de biblioteca = `known-problems` primeiro.** Faça `grep` no registro antes de investigar; registre o desfecho depois.

**Regra inegociável: manter a documentação de _agent-driven development_ atualizada.** Sempre que uma tarefa criar, alterar ou remover endpoint, caso de uso, entidade, integração, contrato, convenção ou comportamento arquitetural relevante, atualize no mesmo trabalho toda a documentação de agentes afetada (`CLAUDE.md`, `AGENTS.md`, `.claude/rules/`, `.agents/rules/`, `.claude/skills/` e `.agents/skills/`), mantendo `.claude/` e `.agents/` sincronizados. Tarefa com documentação de agentes desatualizada está incompleta.

## Desvios conscientes do conjunto original de regras

| Tópico                                         | Conjunto de regras                            | Decisão aqui                                                                                    | Motivo                                                               |
| ---------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| ORM                                            | Drizzle + `pg`                                | **TypeORM 0.3**, `EntityManager` como `tx`, `migration:generate`                                | Entidades e `PostgresSaver` já utilizavam `pg`; reescrita descartada |
| Gerenciador de pacotes                         | pnpm                                          | **bun** (`bun.lock`, Dockerfile, CI)                                                            |                                                                      |
| Testes                                         | Vitest + Testcontainers                       | **Jest** (`ts-jest`); e2e contra `TEST_DATABASE_URL`, Testcontainers apenas como fallback local |                                                                      |
| Identidade                                     | Resource Server, IdP externo                  | Esta aplicação **emite** JWTs HS256 em `/auth/login` (PC-001)                                   | Sem IdP para um motor pessoal                                        |
| Identificadores                                | Idioma do domínio                             | Identificadores em **inglês**, mensagens voltadas ao usuário e Swagger em português             | Código e clientes existentes                                         |
| Prefixo global                                 | `app.setGlobalPrefix(env.API_PREFIX)`         | **Nenhum**                                                                                      | Health checks e clientes dependem dos caminhos atuais                |
| Permissões                                     | Tabelas `roles`/`permissions`                 | **Derivadas do papel (role)** em `src/auth/permissions.ts`                                      | Sem necessidade de concessões por usuário                            |
| Escopo de recurso                              | `AccessScopeService` em recursos de terceiros | **Não implementado**: sem tenants, a equipe atua sobre tudo                                     | Veja `auth.md` para saber quando reintroduzir                        |
| Trilha de auditoria                            | `@AuditAction` + `audit_logs`                 | **Não implementado**                                                                            | Ainda não é necessário                                               |
| Padrão de `INTEGRATION_MODE`                   | `mock`                                        | `mock` apenas quando `NODE_ENV=test`, `live` caso contrário                                     | Arquivos `.env` de desenvolvimento contêm chaves reais               |
| `ResilientClient` em todo lugar                | Toda chamada externa                          | Apenas HTTP feito manualmente (Voyage rerank); SDKs mantêm sua própria pilha (PC-013)           |                                                                      |
| `isolatedModules` / `noUncheckedIndexedAccess` | Ativado                                       | **Desativado** (PC-014; 82 indexações legítimas)                                                |                                                                      |
| Migração de linha de base (baseline)           | Obrigatória                                   | Nenhuma; as migrações são deltas sobre o schema de produção (PC-017)                            | O schema de produção é anterior às migrações                         |

## Gerenciador de pacotes

**Use `bun`.** O lockfile é `bun.lock`, o Dockerfile usa `bun` e a CI executa `bun install` e depois `format:check`, `lint`, `typecheck`, `test`, `test:e2e` e `build`. Os scripts do `package.json` chamam `nest`/`jest` diretamente para que funcionem em qualquer um dos runtimes, mas permaneça no bun para manter o lockfile íntegro.

## Comandos

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
TEST_DATABASE_URL=postgres://postgres@127.0.0.1:5432/split_ai_test bun run test:e2e   # e2e (precisa de Postgres; veja Testes)
bun run test:cov                            # cobertura
bun jest src/path/to/file.spec.ts           # arquivo único
bun jest -t "fragmento do nome do teste"    # teste único por nome
bun run di:verify && bun run di:boot-check  # cabeamento de módulos: alcançabilidade estática + container Nest real (DataSource mockado)
bun run db:generate src/infrastructure/database/migrations/<timestamp>-<name>   # contra um banco espelhando produção
bun run db:check | db:migrate | db:revert | db:show
bun run repair:thread <threadId>            # remove uma thread com checkpoint corrompido do LangGraph
docker compose up                           # api + Redis local + Postgres (para e2e)
```

O servidor de desenvolvimento roda por padrão na **porta 4000** (padrão de `PORT` em `src/shared/config/env.ts`).

## Arquitetura em uma tela

```
src/
  main.ts                    Bootstrap do Fastify (createFastifyAdapter, pipe global, pino, Swagger)
  app.module.ts              Raiz — AppLoggerModule, TypeOrmModule.forRoot(ENTITIES, MIGRATIONS), InfrastructureModule,
                             AuthModule, HealthModule, um módulo agregador por domínio
  auth/                      Guards globais, TokenVerifier, PrincipalResolverService, permissões, request-user.ts
  infrastructure/
    database/schema/         Entidades TypeORM + barrel exportando ENTITIES (único lugar onde tabelas são declaradas)
    database/migrations/     MIGRATIONS (executadas pelo job `migrate` na CI, nunca no boot); data-source.ts para o CLI
    database/transaction-executor/   TransactionExecutor.run(async (tx) => …)
    infrastructure.module.ts @Global() — agrega e publica todos os provedores e clientes externos abaixo
    infrastructure.health.ts Estado por dependência externa (READY | NOT_CONFIGURED | MOCK) reportado por /health/ready
    http-client/             ResilientClient (timeout, retry+backoff, circuit breaker, proteção SSRF, correlação)
    providers/               Provedores de serviços externos (<name>.provider.ts):
                             anthropic, voyage, supabase, twilio, spider, google-vision, gcp-storage, text-to-speech.
                             Exportam tokens, interfaces, factories de client/service e fallbacks mock (INTEGRATION_MODE=mock)
  modules/<domain>/          agents, agent-connections, agent-runtime, retrieval, chat, sessions, sources, store,
                             tools, users, auth-flows, voice, whatsapp
    <domain>.module.ts       Agregador: importa + exporta os módulos de casos de uso, nada além disso
    <use-case>/              Um caso de uso = um módulo = um controller = um endpoint (arquivos kebab-case)
    repositories/            <name>.repository.ts + <name>.repository.module.ts (forFeature + provides/exports)
    contracts/               Portas publicadas para outros domínios, quando necessário
  shared/
    config/env.ts            Objeto `env` congelado e validado com Zod — o ÚNICO lugar que lê process.env
    contracts/               Tipos TS compartilhados + barrel, ErrorResponse, paginação (PageRequest/PageResult/toPaginatedResponse)
    decorators/              @Public, @RequirePermissions, @User
    http/                    Factory do adaptador Fastify, pipe de validação, filtro de exceções, error mapper, pagination.dto, health/
    observability/           Correlação (AsyncLocalStorage), módulo de logger pino, inicialização do Sentry
    utils/                   Funções utilitárias puras, kebab-case
scripts/refactor-di/         di:verify / di:boot-check      scripts/lint/no-comments.ts     scripts/test/prepare-database.ts
test/                        e2e por domínio + support/ (test-app, factories, database) + global-setup
```

## Invariantes específicas do produto (o que as regras não dizem)

- **`AuthenticatedUser`** é `{ id, name, email, phone, role, permissions }`; `id` é sempre um id de usuário real. As roles são `admin` (proprietário: tudo, incluindo `agent.manage` e `user.manage`), `user` (operador de confiança: agents, connections, sources, sessions, analytics, voice, leitura de user) e `guest` (`account.access` + chat). Catálogo: `src/auth/permissions.ts`.
- **`TokenVerifier`** (`src/auth/token.verifier.ts`) aceita apenas `Authorization: Bearer <HS256 JWT>` assinado com `env.JWT_SECRET` (emitido por `GenerateTokenService` em `POST /auth/login`). Usuários são criados por um admin através de `POST /user`; não há cadastro público. Remetentes do WhatsApp são criados automaticamente como usuários pelo webhook.
- **Paginação**: DTOs de listagem estendem `PaginationDto`; repositórios retornam `PageResult`; serviços retornam `toPaginatedResponse()` → `{ items, total, totalPages, page, limit }`. Métodos de listagem recebem `fields?: readonly K[]` antes de `tx?` e retornam `Pick<Entity, K>[]`.
- **Transações** residem nos serviços (`TransactionExecutor.run`), `tx` é o último argumento de toda escrita em repositório; utilizado por `CreateAgent` e `UpdateAgent`. Efeitos colaterais externos rodam após o commit.
- **Soft delete em todo lugar**; índices únicos são parciais (`WHERE "deleted_at" IS NULL`); subconsultas cruas com `from('table')` devem filtrar `deleted_at` por conta própria.
- **Sem prefixo global na API.** Health em `/health/startup` (503 enquanto migrações estiverem pendentes), `/health/live`, `/health/ready` (banco de dados + memória + estado por integração). Swagger em `/docs` apenas com `SWAGGER_ENABLED=true` fora de produção.
- **Ordem de bootstrap é fixa** (`src/main.ts`): `dotenv/config` → `createFastifyAdapter()` (helmet, multipart, correlação via `x-request-id`) → pino (`AppLoggerModule`, mascara cabeçalhos de autenticação) → CORS a partir de `ALLOWED_ORIGINS` (vazio = reflete qualquer origem; `*` é rejeitado) → pipe global → shutdown hooks → Swagger → listen. O Helmet roda com seus padrões mais COEP `require-corp` (CSP, `X-Frame-Options`, CORP/COOP `same-origin`). O CORS permite apenas `ALLOWED_ORIGINS` (`.env.example`: as aplicações maia locais nas portas 3000/4200); um valor vazio ainda reflete qualquer origem, portanto configure-o onde quer que a API esteja implantada. `DevtoolsModule` é ignorado sob `NODE_ENV=test` (PC-018).
- **`env.ts` é o único leitor de `process.env`**; nova variável → schema Zod **e** `.env.example`. Nunca cole valores secretos em mensagens ou commits.
- **Lint além das regras**: `import/order` (builtin → external → `src/…`), kebab-case em `check-file`, `no-restricted-imports` para `./` `../` (exceto pasta do schema), `no-console`, `no-inline-comments`, `no-warning-comments`, `consistent-type-imports` (mantém imports de valor para parâmetros de construtor decorados — nunca escreva manualmente `import type` neles), `no-explicit-any` (exceto specs) e `scripts/lint/no-comments.ts` como último passo de `bun run lint`. O conhecimento que costumava ficar em comentários está em `docs/decisoes-de-dominio.md`.
- **Três casts intencionais**: payloads de `update()` do TypeORM (`as QueryDeepPartialEntity<Entity>`, PC-015), registro de plugin do Fastify (`as unknown as AdapterPlugin`, PC-016), tipos de dupla identidade do LangChain (`as unknown as BaseRetrieverInterface` / `VectorStoreInterface` / `Embeddings`, PC-005, PC-012).

## Integrações externas

- **Provedores.** Dependências externas ficam em `src/infrastructure/providers/<name>.provider.ts` e são registradas no `@Global()` `InfrastructureModule`:
  - `CHAT_MODEL_SERVICE` (`IChatModelService`): constrói instâncias de `ChatAnthropic` configuradas para Anthropic ou DeepSeek.
  - `EMBEDDINGS_SERVICE` (`IEmbeddingsService`): embeddings Voyage `voyage-3-large` (1024 dimensões).
  - `RERANKER_SERVICE` (`IRerankerService`): cross-encoder Voyage `rerank-2.5` via `ResilientClient`.
  - `SUPABASE_CLIENT` / `VECTOR_STORE_SERVICE` (`IVectorStoreService`): armazenamento pgvector do Supabase.
  - `TWILIO_CLIENT` / `TWILIO_SERVICE` (`ITwilioService`): mensageria do WhatsApp via Twilio e parsing de mensagens recebidas.
  - `GCP_STORAGE_SERVICE` (`IGcpStorageService`): upload e gerenciamento de arquivos no Google Cloud Storage.
  - `TEXT_TO_SPEECH_SERVICE` (`ITextToSpeechService`): Google TTS ou ElevenLabs via `TTS_PROVIDER`.
  - `GOOGLE_VISION_SERVICE` (`IGoogleVisionService`): OCR com Google Cloud Vision.
  - `SPIDER_SERVICE` (`ISpiderService`): carregador para web crawling do Spider.
- Injete por token (`@Inject(TOKEN)`), tipe por interface (`IService`); nenhum módulo de domínio importa `InfrastructureModule` diretamente porque ele é `@Global()`.
- **Modo mock nos testes.** Cada provedor fornece uma implementação mock quando `env.INTEGRATION_MODE === 'mock'`.
- **Credenciais ausentes nunca quebram o boot.** Um provedor real sem sua chave reporta `NOT_CONFIGURED` em `infrastructure.health.ts` e lança `ServiceUnavailableException` somente quando invocado. Clientes Google dependem de ADC e são construídos sob demanda (`READY`).
- **`ResilientClient`**: timeout com `AbortController`, retentativa com backoff + jitter apenas em `GET`/`HEAD`/`OPTIONS` e 408/425/429/5xx, circuit breaker por dependência, `redirect: 'error'`, propagação de `x-request-id`, proteção contra SSRF (lista de permissões `HTTP_ALLOWED_HOSTS`, padrão `api.voyageai.com`). Um novo host deve ser adicionado à lista de permissões.
- **Env:** `INTEGRATION_MODE`, `HTTP_*`, `ANTHROPIC_BASE_URL` (padrão aponta para o endpoint do DeepSeek compatível com Anthropic; defina-o explicitamente para acessar a Anthropic), `TTS_PROVIDER`, `GCS_AUDIO_BUCKET`.

## Fundamentos do pipeline de IA

- **Fluxo:** `POST /chat/:agentId` (stream NDJSON) → `CreateSessionIfNotExists` (sessões expiram em 8 horas) → `ResolveAgent` (`CHAT_MODEL_SERVICE`, `ToolLoaderService`, `LoadStoreService`, `createDeepAgent`) → `GenerateAiResponse` (`createDeepAgent` com `CompositeBackend` [`StateBackend` + `StoreBackend`], `responseFormat: AgentFinalResponseSchema`, `handleStreamResponse`) → `RecordChatMessage` (gera embeddings via `EMBEDDINGS_SERVICE`). `thread_id` é `conversationId ?? session.id`.
- **Agentes e instruções:** Instruções são armazenadas diretamente em `system_prompt` (TEXT) em `AgentEntity`. A tabela anterior `agents_instructions` e o modelo `AIInstructions` (`context`, `objetivo`, `diretrizes`) foram removidos. O modelo padrão é `deepseek-chat-v3.2`.
- **Ferramentas:** `tools` é uma coluna de array de strings em `AgentEntity` (`default: ['vector_search']`), carregada dinamicamente pelo `ToolLoaderService` (`src/modules/tools/tool-loader/`). As ferramentas disponíveis incluem busca vetorial (`src/modules/tools/vector-search-tool/`) e busca na web com Tavily (`src/modules/tools/tavily-search/`). A ferramenta de banco de dados externo (`execute_sql`, `CUSTOMER_DATABASE`) foi removida.
- **Saída estruturada:** coluna de JSON schema `response_format` em `AgentEntity`.
- **Store & VFS:** Memória e habilidades usam Deep Agents (`deepagents`) suportados por `CompositeBackend` (`StateBackend` efêmero na raiz, `StoreBackend` para `/memories/` e `/skills/` persistidos no Supabase via `PostgresStore`).
- **Recuperação tem escopo apenas por agente.** `vector_similarity_search` recebe apenas `query` e filtra chunks por `{ agent_id }`; o `source_type` registrado em cada chunk não restringe mais a busca, permitindo encontrar arquivos sem tipo definido e sites rastreados.
- **Recuperação é baseada em limiar (threshold), não em top-K.** `vector_similarity_search` busca candidatos de acordo com `VECTOR_SEARCH_CANDIDATE_K` (50) e o `VoyageRerankCompressor` mantém aqueles com pontuação `>= VECTOR_SEARCH_MIN_SCORE` (0.8), limitados a `VECTOR_SEARCH_MAX_RESULTS` (10). Resultados vazios são esperados por design; o `warn` com a melhor pontuação é o sinal para ajuste fino. Nunca mova a nota de corte para a pontuação de cosseno.
- **Uma busca custa duas chamadas à Voyage** (embed + rerank) na mesma `VOYAGEAI_API_KEY`; sem um método de pagamento padrão, a cota é de 3 RPM / 10K TPM (PC-007).
- **Ingestão** (`sources/process-*-source`) deve etiquetar cada chunk com `agent_id` + `source_id` antes de `VECTOR_STORE_SERVICE.upsertChunks`; a tabela `documents`, `match_documents` e o índice pgvector vivem apenas no Supabase e são aplicados manualmente em seu editor SQL.
- **Ingestão é assíncrona.** `POST /agent/generate-source` (`source.write`) valida primeiro (tipo de arquivo não suportado → 400, agente desconhecido → 404), cria as linhas em `sources` como `processing`, responde **202** e indexa em segundo plano; clientes acompanham o status via `GET /source`. Uma fonte removida durante a indexação tem seus chunks excluídos quando sua tarefa termina, e no boot o `RecordInterruptedSourcesService` marca as fontes remanescentes em `processing` como `failed`. Detalhes em `.claude/rules/rag-ingestion.md`.

## Testes

- **Duas camadas.** Specs unitárias (`src/**/*.spec.ts`) apenas para funções puras e módulos autocontidos (mappers, `sql-guard`, http-client, permissions, `TokenVerifier`, `VoyageRerankCompressor`, utils), além das specs de módulos Nest `auth-layer.spec.ts` e `http-layer.spec.ts`. Uma spec de serviço que moca um repositório **não** deve ser adicionada; esse comportamento pertence a `test/<domain>.e2e-spec.ts`.
- **Um arquivo e2e por domínio** (`test/*.e2e-spec.ts`, serial): caminho feliz, 400 com `details`, 401, 403 (permissão ausente) e 404 por caso de uso. `createTestApp()` inicializa o `AppModule` real no Fastify com `INTEGRATION_MODE=mock`; fixtures de `test/support/factories.ts`; `t.reset()` trunca todas as tabelas no `beforeEach`.
- **Banco de dados.** `test/global-setup.ts` usa `TEST_DATABASE_URL` (CI: container de serviço `postgres:16-alpine`; local: `docker compose up postgres`) ou um Postgres via Testcontainers; em seguida, `scripts/test/prepare-database.ts` sincroniza o schema a partir das entidades e marca as migrações como aplicadas (PC-017). As migrações, portanto, não são exercitadas pelo e2e; teste uma nova migração manualmente contra um banco construído a partir das entidades anteriores.

## Pontos de atenção

- **Mudanças de schema passam por migrações; `synchronize` fica desligado.** Entidade → `bun run db:generate …` contra um espelho de produção → revisão (`CREATE INDEX CONCURRENTLY` + `transaction = false` em tabelas grandes) → commit de entidade e migração juntos. `db:check` falha quando eles divergirem (PC-011).
- **`ContextualCompressionRetriever` vem de `@langchain/classic`** (PC-005); `@langchain/langgraph` deve permanecer alinhado com a versão esperada por `langchain@1.x` (`MemorySaver` deve ser um `BaseCheckpointSaver`).
- **Scripts do TypeORM rodam sob ts-node/CommonJS**, nunca sob o loader ESM do bun (PC-006): `db:*`, `test:db:prepare`, `repair:thread`.
- **`.env` é ignorado pelo git; `.env.example` é o modelo.** A ausência de `DATABASE_URL` ou `JWT_SECRET` aborta o boot listando todos os problemas.

## Commit & CI

- Conventional Commits aplicados pelo commitlint (`build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test`). Assunto em letras minúsculas, sem ponto final, linha em branco antes do corpo.
- Husky `pre-commit` executa `lint-staged` → ESLint + Prettier nos arquivos em stage.
- **A API de produção roda no Railway** em https://split-ai-production-4200.up.railway.app (`/health/live` responde sem autenticação). O Railway compila e faz novo deploy a partir da `main` fora da CI deste repositório (cerca de um minuto após um merge), portanto fazer merge na `main` envia para produção; suas variáveis de ambiente (incluindo `ALLOWED_ORIGINS`) são configuradas no dashboard do Railway. O Railway vincula `$PORT`, motivo pelo qual `env.PORT` não possui um valor fixo de produção.
- `.github/workflows/ci-cd.yml`: PRs executam `format:check`, `lint`, `typecheck`, `test`, `test:e2e` (container de serviço Postgres) e `build`. Pushes na `main` executam a CI e em seguida o job `migrate` (`db:migrate` contra `secrets.DATABASE_URL`, concorrência 1). Não há job de deploy.
- **`secrets.DATABASE_URL` deve ser a URL do session pooler do Supabase** (`aws-0-<region>.pooler.supabase.com:5432`, usuário `postgres.<project-ref>`). O host direto `db.<project-ref>.supabase.co` é exclusivo IPv6 e runners do GitHub falham com `ENETUNREACH`; o transaction pooler (porta `6543`) quebra `CREATE INDEX CONCURRENTLY`. Configure a partir de um terminal real (`gh secret set DATABASE_URL`) ou pela interface do GitHub — executado sem TTY, o `gh` armazena um valor vazio.
