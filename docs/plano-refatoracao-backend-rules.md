# Plano de refatoração: `split-ai` alinhado a `ai-agents-engineering/docs/backend`

Baseline: commit `0857e7b` do `split-ai` (471 arquivos `.ts`, 146 módulos, 62 controllers, 66 handlers HTTP, 91 services, 22 entidades, 21 specs, 1 e2e). Referência: `ai-agents-engineering/docs/backend/rules/00` a `12` (commit `d3ba08f`).

Cada seção abaixo cita o arquivo dono da regra em `rules/`. O plano descreve o que fazer, não como digitar. Fases são incrementais: cada uma termina com a aplicação subindo, lint limpo e os testes existentes passando.

---

## 1. Objetivo

Levar o `split-ai` ao padrão descrito nas regras de backend (topologia, caso de uso = endpoint, guards globais, filtro de exceção, repositórios com projeção, exclusão lógica, integrações atrás de porta, env validado), preservando o comportamento dos 66 endpoints e o pipeline de IA (LangGraph + Voyage + pgvector).

Fora do escopo: reescrever o pipeline de IA, trocar o produto de autenticação (o `split-ai` emite seus próprios tokens), mudar o contrato dos endpoints consumidos pelo widget e pelo BravoHub.

---

## 2. Decisões de adoção

As regras assumem uma stack (`00-visao-geral.md`) diferente da atual. A tabela fixa o que entra, o que se adapta e o que fica de fora, para que o restante do plano não reabra o assunto.

| Tema | Regra | Hoje no `split-ai` | Decisão |
| --- | --- | --- | --- |
| ORM | Drizzle + `pg` + migrations geradas (`09`) | TypeORM 0.3 com `synchronize: true` contra o Supabase | **Adaptar.** Manter TypeORM; adotar as regras de schema, exclusão lógica, `tx` opcional, projeção e migrations usando o equivalente TypeORM (`EntityManager` como executor; `migration:generate`). Troca para Drizzle só com decisão explícita do solicitante (Fase 5 lista o custo). |
| Gerenciador de pacotes | pnpm | bun (`bun.lock`, Dockerfile, CI) | **Não adotar.** Manter bun. Regra de verificação (`format:check`, `lint`, `typecheck`, `test:e2e`, `build`) é adotada com os scripts equivalentes. |
| Testes | Vitest + Testcontainers | Jest + ts-jest, 1 e2e placeholder | **Adaptar.** Manter Jest; adotar Testcontainers para e2e com Postgres real e a regra "um e2e por caso de uso". |
| Logging | `nestjs-pino` | `Logger` do Nest + hooks manuais no `main.ts` + 10 `console.*` | **Adotar** `nestjs-pino` com redação de campos sensíveis; remover os hooks de log do `main.ts` (hoje logam `body` inteiro, inclusive de `/auth/login`). |
| Swagger | `@nestjs/swagger` com plugin do `nest-cli` | Nenhum (`@fastify/swagger`, `fastify-swagger` e `swagger-jsdoc` instalados e não usados) | **Adotar** fora de produção; remover as três libs mortas. |
| Autenticação | Resource Server, IdP externo, sem login (`08`) | `split-ai` é o IdP: `/auth/login`, `/auth/register-lite`, SMS, `GenerateToken` com `@nestjs/jwt` | **Adaptar.** Manter emissão de token (requisito de produto). Adotar o restante: dois `APP_GUARD` globais, `@Publico()`, verificação concentrada em um `TokenVerifier`, autorização por permissão. O desvio fica registrado como `PC` em `12`. |
| Idioma de identificadores | Vocabulário de domínio na língua do produto (`02`) | Identificadores em inglês, mensagens em português (regra do `CLAUDE.md`) | **Não adotar a troca de nomes.** 471 arquivos e consumidores externos (widget, BravoHub) tornam o rename puro custo. Manter inglês para pastas/classes e português para mensagens e Swagger. Registrar como desvio consciente no `CLAUDE.md`. |
| Prefixo global | `app.setGlobalPrefix(env.API_PREFIX)` (`01`) | Sem prefixo; rotas em `/support/question`, `/auth/login`, `/public/embed/chat.js` | **Não adotar agora.** Quebra widget, Cloud Run health e BravoHub. Reavaliar quando houver versionamento de API. |
| Modelo de permissões | Tabelas `papeis`/`permissoes`/exceções (`08`) | `users.role` + `users.org_role` (`owner`/`admin`/`member`) no JWT | **Adaptar em duas etapas.** Fase 2 troca `@Roles`/`@OrgRoles` por `@ExigirPermissoes` com permissões derivadas do `org_role` no `PrincipalResolver`. Tabelas de permissão só se o produto pedir granularidade. |
| Comentários | Nenhum comentário no código (`02`) | 393 linhas de comentário | **Adotar** progressivamente: lint `no-inline-comments` + `no-warning-comments` em `warn` na Fase 0, `error` na Fase 7. |
| `strict` | `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride` (`02`) | `strictNullChecks: false`, `noImplicitAny: false`, 149 usos de `any` | **Adotar** por diretório na Fase 7, com `strictNullChecks` primeiro. |

---

## 3. Diagnóstico: regra × estado atual

| Regra (dono) | Estado atual | Evidência |
| --- | --- | --- |
| `process.env` só em `env.ts`; env validado com Zod; boot falha listando problemas (`01`) | `config.ts` lê `process.env` sem validação; leituras fora dele em `auth.guard.ts`, `main.ts`, `app.module.ts`, `create-checkout.controller.ts`; `GenerateTokenService` usa `ConfigService` do `@nestjs/config` para `JWT_SECRET` | 7 ocorrências fora de `config.ts`; sem `.env.example`; `.env` com segredos versionado |
| Imports absolutos a partir de `src/` (`01`) | Mistura de absoluto e relativo | 593 imports relativos (`./`, `../`) |
| kebab-case em arquivos e pastas (`02`) | Arquivos em kebab-case; pastas de escopo e caso de uso em PascalCase (`components/AIChat/Question/`); utils em camelCase (`buildZodSchema.ts`, `chunkText.ts`) | 100% das pastas de `components/` |
| Topologia `modules/<dominio>/`, `shared/`, `infrastructure/<recurso>/` (`01`) | `components/`, `repositories/` e `entities/` globais, `types/models/` global, `services/cep.service.ts` solto, `decorators/` e `auth/` na raiz | `src/` com 13 pastas de topo |
| Um caso de uso = um endpoint; controller só `handle()` (`02`, `05`) | 3 controllers com múltiplos handlers; 1 caso de uso `ListAgents` convive com `GET /agent` em `UpdateAgent` | `update-agent.controller.ts` (GET `/agent`, GET `/agent/:id`, PATCH `/agent/:id`), `public-embed.controller.ts` (2), `send-sms.controller.ts` (2) |
| Service só `execute()` com retorno explícito (`05`) | 6 services com mais de um método público; 20 `execute()` sem tipo de retorno | `UpdateAgentService`, `RerankDocumentsService`, `LoadPdfService`, `EmailService`, `SendSmsService`, `GenerateTokenService` |
| Controller sem `try/catch`, sem `@UseGuards`; filtro global converte em `ErrorResponse` (`05`, `07`) | Todo controller tem `try/catch` com 12 formatos diferentes de erro; 51 controllers com `@UseGuards`; sem `APP_FILTER` | 23× `send(error.message)` em texto puro, 6× `send(error)` (vaza stack), 4× `{ error }`, 1× `{ message }` |
| `@Body(new ValidationPipe({ forbidUnknownValues: true }))`; `whitelist`/`forbidNonWhitelisted` (`01`, `05`) | 20× `new ValidationPipe()` sem opções; 13 handlers com `@Body()` cru | Sem validação em `/support/question`, `/chat/attendant`, `/agent/create`, `/organization/create`, `/user/update`, webhooks |
| DTO: toda string com `@MaxLength`, array com `@ArrayMaxSize` (`05`) | Nenhum DTO usa `@MaxLength`/`@ArrayMaxSize` | 25 de 38 DTOs têm `@IsString` sem limite |
| Toda rota privada por padrão; `@Publico()` só com requisito; guards globais (`08`) | Nenhum guard global; rota sem `@UseGuards` é pública por omissão | 13 controllers sem guard, entre eles `/agent/text-to-speech` e `/agent/generate-source` (ambos deveriam ser privados), `GET /source/:id` sem `@Res` |
| Autorização por permissão, não por papel (`08`) | `@Roles` (26 controllers) por `role` global e `@OrgRoles` (15) por `org_role`; dois guards diferentes leem metadata | `AuthGuard` faz autenticação **e** autorização por `@Roles` |
| Verificação de token em uma única classe (`08`) | `verifyJwt` + `verifyBravohubJwt` como funções soltas no `auth.guard.ts`; `Public` definido no mesmo arquivo | `auth.guard.ts` com 170 linhas |
| Guard não faz I/O; escopo de recurso no service via `AccessScopeService` (`08`) | `ActiveOrgGuard` injeta `DataSource` e consulta `agents` lendo `agentId` do body; checagem de posse inline em services | `active-org.guard.ts` |
| `request.user` tipado por augmentação (`08`) | `src/types/fastify.d.ts` existe, mas guards usam `getRequest()` sem tipo e montam o usuário à mão com 15 campos | `auth.guard.ts` monta `UserEntity` falso com `password_hash: ''` |
| Health: `/health/startup`, `/health/live`, `/health/ready` (`07`) | Só `GET /health` retornando `{ status: 'ok' }` | `health.controller.ts` |
| Correlação de request via `AsyncLocalStorage`; `x-request-id` na resposta (`07`) | `requestId` montado como `METHOD-url-timestamp` em um `Map` global | `main.ts` |
| Logging estruturado, sem dado sensível (`07`) | Hook `onRequest` loga `request.body` inteiro; 10 `console.*` | `main.ts`, `webhook.service.ts`, outros |
| Toda tabela com `created_at`/`updated_at`/`deleted_at`; sem `DELETE` físico (`09`) | 0 entidades com `@DeleteDateColumn`; 4 sem `updated_at`; `organizations` sem `created_at`; 5 repositórios fazem `delete`/`remove` físico | `credit-transaction`, `notification`, `organization`, `token-usage`; `sms-verification`, `agent-connection`, `organization`, `user`, `source` repositories |
| Schema versionado por migration; `db:push` proibido (`09`) | `synchronize: true` + `autoLoadEntities` apontando para o Supabase de produção; nenhuma migration no repo | `app.module.ts` |
| Pool com timeouts, listener de erro, sonda no boot, `onApplicationShutdown` (`09`) | Pool default do TypeORM; nenhum módulo implementa `OnApplicationShutdown` | 0 ocorrências |
| Repositório sem interface genérica, sem passthrough de opções do ORM; projeção no `select` (`05`, `09`) | Repositórios expõem `find(options)`, `findOne(options)`, `count(options)` do TypeORM; `MessageRepository` injeta `VOYAGE_EMBEDDINGS` e gera embedding dentro do `create` | 13 services fazem `.map` sobre resultado de repositório; `message.repository.ts` |
| Paginação `{ items, total, totalPages, page, limit }` com `count` em paralelo (`05`) | Listagens sem paginação (`listByOrganization`, `GET /agent`, `/api-key/list`, `/organization/list`) | `api-key.repository.ts`, `list-agents.service.ts` |
| Transação só no service via executor; repositório recebe `tx?` (`09`) | Nenhum repositório recebe `tx`; `CreateOrganizationService` (3 repositórios) e `StripeWebhookService` gravam em várias tabelas sem transação | 6 services injetam 3 ou mais repositórios |
| Fonte externa → conector → contrato Zod → mapeador → domínio; só `infrastructure/integration/` chama rede (`10`) | `axios` em `load-pdf.service.ts` e `services/cep.service.ts`; `fetch` em `utils/getUrlBuffer.ts`; `ImageAnnotatorClient` instanciado dentro de `extract-ocr-text.module.ts`; webhooks Stripe/Twilio consomem payload cru sem contrato | 3 arquivos com chamada de rede fora de `infrastructure/` |
| Tokens `Symbol` em `*.tokens.ts`; porta com `useExisting` (`06`) | Tokens string (`'STRIPE_CLIENT'`, `'VOYAGE_EMBEDDINGS'`) definidos no próprio provider; `Provider[]` exportado em vez de módulo com porta | 11 providers em `infrastructure/providers/` |
| `ResilientClient` com timeout, retry, circuit breaker, SSRF guard (`10`) | Nenhum cliente HTTP resiliente; `LoadDatabaseTool` abre `DataSource` por request contra URL vinda do banco do cliente sem allowlist de host | `load-database-tool.service.ts` |
| Sem dependência circular (`06`) | 4 módulos usam `forwardRef` em 2 ciclos: `ResolveAgent` ↔ `LoadAgentTools`, `AppendConnectionTools` ↔ `InvokeConnectedAgent` | 8 ocorrências |
| Sem dependência sem necessidade (`00`) | 30+ pacotes sem nenhum import: `mongoose`, `@nestjs/mongoose`, `kafkajs`, `aws-sdk`, `sqlite3`, `redis`, `@upstash/redis`, `@langchain/redis`, `@langchain/openai`, `@langchain/google-vertexai`, `openai`, `openevals`, `winston`, `joi`, `cheerio`, `gm`, `currency.js`, `flat`, `bcrypt` (usa `bcryptjs`), `cors`, `@fastify/jwt`, `@fastify/autoload`, `@fastify/swagger`, `fastify-swagger`, `swagger-jsdoc`, `compute-cosine-similarity`, `node-sql-parser`, `pdfjs-dist`, `pdf-parse`, `@sentry/tracing`, `@nestjs/platform-express`, `path`, `bun` como dependência de runtime | `package.json` |
| `AppModule` importa só agregadores de domínio; `APP_FILTER`/`APP_INTERCEPTOR` nele (`01`) | `AppModule` registra `JwtService` como provider, `ThrottlerModule` (guard usado em 1 rota), `ScheduleModule` (nenhum cron), `DevtoolsModule` | `app.module.ts` |
| Teste e2e por caso de uso com banco real (`05`) | 1 e2e placeholder; 16 specs de service com mocks; 5 specs de util | `test/app.e2e-spec.ts` |
| `12-problemas-conhecidos.md` com travas registradas (`12`) | Travas conhecidas espalhadas em prosa no `CLAUDE.md` (`ContextualCompressionRetriever` de `@langchain/classic`, cast `BaseRetrieverInterface`, TDZ do seed sob bun, cota Voyage) | `CLAUDE.md` seção "Things that bite" |
| `README` do projeto | Template do NestJS intocado | `README.md` |

---

## 4. Fases

Ordem pensada para que cada fase reduza risco da seguinte. Fases 0, 1 e 7 podem avançar em paralelo com qualquer outra; 3 depende de 2; 4 depende de 3; 5 e 6 dependem de 3.

### Fase 0 — Higiene e base de ferramentas (sem mudança de comportamento)

Dono das regras: `01`, `02`, `00`.

1. Criar `src/shared/config/env.ts` com schema Zod, objeto congelado e campos derivados (`isProduction`, `isTest`). Migrar todo consumidor de `config.ts` e cada `process.env` fora dele (`auth.guard.ts`, `main.ts`, `app.module.ts`, `create-checkout.controller.ts`, `GenerateTokenService` via `ConfigService`). Boot falha listando variáveis inválidas.
2. Criar `.env.example` com toda variável do schema. Remover `.env` do versionamento (`git rm --cached`), manter em `.gitignore`. Rotacionar os segredos expostos (Supabase service key, Stripe live, Twilio, LangSmith) fora do repositório.
3. Remover `@nestjs/config` e `JwtService` do `AppModule`; `GenerateTokenService` passa a ler `env.JWT_SECRET` e `env.JWT_EXPIRATION_HOURS`.
4. Remover as dependências sem import listadas no diagnóstico. Manter `bun` apenas como ferramenta, não em `dependencies`. Rodar `bun run build` e `bun run di:boot-check` após cada lote de remoção.
5. Remover `ScheduleModule` (sem cron), `DevtoolsModule` (ou condicionar a `env.isProduction === false` via `env`), e mover `ThrottlerModule` para o único módulo que usa `ThrottlerGuard` (`SendSms`) ou descartá-lo.
6. ESLint: adicionar `no-console` (`error`), `no-inline-comments` + `no-warning-comments` (`warn` nesta fase), `import/no-relative-parent-imports` e regra de kebab-case em nome de arquivo (`check-file` ou `unicorn/filename-case`) em `warn`. Remover `import/no-unused-modules` (hoje em `warn` e ruidoso) ou promovê-lo a `error` após a Fase 3.
7. `tsconfig.build.json`: desativar `incremental`. Adicionar script `typecheck` (`tsc --noEmit -p tsconfig.build.json`) e `format:check`. CI roda `format:check`, `lint` (sem `--fix`), `typecheck`, `test`, `build`.
8. Reescrever `README.md` para o projeto (comandos, variáveis, deploy). Apagar `DI-REFACTOR.md` (documento de trabalho de refactor já concluído).

Pronto quando: `grep process.env src` devolve só `env.ts`; `bun install` não traz pacotes não importados; CI com os cinco comandos verdes.

**Status: concluída.** Desvios em relação ao previsto: o `.env` já não estava versionado (o `CLAUDE.md` estava desatualizado); `services/cep.service.ts` foi removido por não ter consumidor; `GenerateTokenService` passou a usar `jsonwebtoken` diretamente, dispensando `@nestjs/jwt`; `DevtoolsModule` ficou condicionado a `env.isProduction` em vez de removido; `ThrottlerModule` migrou para `SendSmsModule`; o resolver TypeScript do `eslint-plugin-import` não foi ativado porque reclassificaria `src/...` como grupo interno e reordenaria imports em 312 arquivos (fica para a Fase 3, junto com a conversão para imports absolutos). As quatro suítes de teste que falhavam antes da fase (`ConvertTextToSpeech`, `Login`, `SignUp`, e `GenerateToken`, esta corrigida) são placeholders sem providers mockados e ficam para a Fase 8.

### Fase 1 — Transversais: filtro de exceção, correlação, logger, health

Dono das regras: `07`, `01`.

1. Criar `src/shared/contracts/error-response.ts` (`category`, `code`, `message`, `status`, `correlationId`, `timestamp`, `path`, `details`) e `src/shared/http/error-mapper.ts` (`HttpException` → status/`HTTP_<status>`; `ZodError` → 400 `VALIDATION_FAILED`; demais → 500 `INTERNAL_ERROR` com mensagem genérica em produção).
2. Criar `GlobalExceptionFilter` com `@Catch()` registrado como `APP_FILTER` em `AppModule`. Log `error` para ≥ 500 e `warn` para 4xx.
3. Criar `src/shared/observability/correlation.ts` com um único `AsyncLocalStorage`, registrado via hook `onRequest` do adapter; reaproveitar `x-request-id` recebido ou gerar UUID; devolver `x-request-id`.
4. Adotar `nestjs-pino` (`AppLoggerModule`) com redação de `authorization`, `cookie`, `password`, `password_hash`, `token`, `secret`, `key_hash`. Remover os dois hooks de log de `main.ts` e os 10 `console.*`. Rotas de health sem log de request. Sentry: manter `initSentryIo` e integrar com o filtro, removendo o `@sentry/tracing` morto.
5. Criar `createFastifyAdapter()` e `createValidationPipe()` em `src/shared/http/`, usados por `main.ts` e pelos e2e. `main.ts` passa a seguir a ordem da regra: `dotenv/config` na primeira linha, adapter, helmet + CORS por allowlist (`env.ALLOWED_ORIGINS`, rejeita `*`), correlação, pipe global, `enableShutdownHooks`, Swagger fora de produção, `listen` em `env.PORT`.
6. Pipe global com `transform`, `whitelist`, `forbidNonWhitelisted`, `forbidUnknownValues`, `enableImplicitConversion: false`. Para os 13 handlers com `@Body()` cru, criar/ajustar DTOs antes de ativar o pipe. Webhooks (Stripe, Twilio) recebem DTO próprio com os campos usados e um contrato Zod na Fase 6; o `StripeWebhook` precisa do corpo cru para validar assinatura, então registra `rawBody` no adapter e fica fora do `whitelist` do pipe.
7. Remover `try/catch` de todos os 62 controllers; `handle()` passa a `res.status(<código>).send(resultado)`. **Exceção documentada:** `QuestionController` e `AttendantController` fazem `res.hijack()` e streaming NDJSON; mantêm `try/catch` local porque o filtro global não alcança resposta já iniciada. Registrar como `PC` em `12`.
8. Health: substituir `GET /health` por `/health/startup` (migrations aplicadas), `/health/live` (processo) e `/health/ready` (pool do Postgres, Supabase, memória), todos com `@Publico()`. Atualizar o health check do Cloud Run.
9. `AuditInterceptor` + `@AcaoAuditoria` + tabela de auditoria imutável (`registrado_em`, sem `updated_at`/`deleted_at`). Aplicar o rótulo em toda mutação. Esta etapa pode ser adiada para depois da Fase 5 se a equipe preferir, pois cria tabela.

Pronto quando: nenhum controller tem `catch` fora dos dois de streaming; toda resposta de erro tem o formato `ErrorResponse`; `grep console. src` vazio.

**Status: concluída, exceto o item 9 (auditoria), adiado para depois da Fase 5 por criar tabela com `synchronize: true` apontando para produção.** Desvios: só `QuestionController` faz streaming (o `AttendantController` responde JSON normal), então há um único `try/catch` remanescente; CORS ficou por allowlist opcional (`ALLOWED_ORIGINS`; vazio reflete qualquer origem porque o widget público roda em domínios de clientes, e `*` é rejeitado pelo schema); helmet sem CSP, `frameguard` e CORP pelo mesmo motivo; o webhook do WhatsApp recebe `Record<string, string>` e o upload de fonte lê `req.body`, ambos fora do pipe global até ganharem contrato Zod na Fase 6; `GET /health` foi substituído pelas três rotas sem alias (o deploy do Cloud Run não configura probe HTTP). Correção colateral: o workflow passava `NODE_ENV=ENV` literal ao Cloud Run, o que falharia na validação de env.

### Fase 2 — Autenticação e autorização

Dono das regras: `08`, `07`.

1. Criar `src/auth/token.verifier.ts` concentrando `verifyJwt` (HS256 nativo), o bridge BravoHub (HS512 com `BRAVOHUB_JWT_SECRET`) e a resolução de `ApiKey` (hash em `api_keys`, fallback `chat_embed_token`). Qualquer falha → `UnauthorizedException`. Retorna um `Principal` discriminado (`user` | `service` | `bravohub`).
2. Criar `principal-resolver.service.ts` que transforma o `Principal` em `UsuarioAutenticado` tipado (`id`, `organization_id`, `role`, `org_role`, `permissoes`, `companyId` opcional), substituindo os dois blocos que montam um `UserEntity` falso. Permissões efetivas derivadas do `org_role` por tabela fixa no código: `owner` ⊃ `admin` ⊃ `member`; `service` recebe só as permissões de chat. Cache em memória com TTL `env.AUTH_PRINCIPAL_CACHE_TTL_MS`; `UpdateMemberRole` e `RemoveMember` chamam `invalidate` após gravar.
3. `AuthenticationGuard` global lendo `@Publico()` e o header `Authorization` (`Bearer` ou `ApiKey`), delegando ao `TokenVerifier`; absorve `AuthGuard`, `ApiKeyGuard` e `CompositeAuthGuard`, que são removidos.
4. `AuthorizationGuard` global lendo `@ExigirPermissoes(...)`, sem I/O. Mapear cada `@Roles(...)`/`@OrgRoles(...)` existente para uma chave `<recurso>.<acao>` (`agent.read`, `agent.write`, `api-key.manage`, `organization.manage`, `member.manage`, `credit.read`, `report.read`, `session.read`, `user.manage`). Remover `@Roles`, `@OrgRoles`, `OrgRoleGuard` e os 51 `@UseGuards`.
5. Marcar `@Publico()` explicitamente nas rotas que são públicas por requisito: `/auth/login`, `/auth/register-lite`, `/auth/check-user`, `/auth/send-sms`, `/auth/verify-sms`, `/register/sign-up`, `/organization/members/accept-invite`, `/payment/webhook`, `/payment/public-key`, `/payment/plans`, `/public/embed/*`, `/whatsapp/webhook`, `/health/*`. **Decisão pendente para o solicitante:** `POST /agent/text-to-speech` e `POST /agent/generate-source` estão públicos hoje sem guard e parecem esquecimento; o plano assume privados.
6. `ActiveOrgGuard`: deixa de injetar `DataSource`. A checagem "organização inativa" passa para o `PrincipalResolver` (lê `organizations.status` via repositório ao resolver o principal). A checagem por `agentId` do body sai do guard e vai para `ResolveAgentService`, que já carrega o agente.
7. Criar `access-scope.service.ts` com `garantirPode(usuario, permissao, { tipoEscopo: 'organization', idEscopo })`. Substituir as 7 checagens inline de `organization_id` nos services de `UpdateAgent`, `CreateAgentConnection`, `ListAgentConnections`, `SaveAgentConnectionLayout`, `GetSessionMessages`, `GetReport` e `GetReportConversation`. Services que hoje não checam posse de recurso de terceiro (`GetSource`, `DeleteSource`, `RevokeApiKey`) passam a chamar `garantirPode` após carregar o recurso.
8. `@Usuario()` em `src/shared/decorators/usuario-atual.decorator.ts` substituindo `src/decorators/user.decorator.ts`; `exigirUsuario(request)` em `src/auth/request-user.ts`; `fastify.d.ts` passa a tipar `request.user: UsuarioAutenticado`.
9. Registrar em `12-problemas-conhecidos.md` (cópia local em `docs/problemas-conhecidos.md`) o desvio "aplicação emite o próprio JWT" e o bridge BravoHub.

Pronto quando: `grep @UseGuards src` vazio; `grep @Roles\( src` vazio; toda rota tem `@ExigirPermissoes` ou `@Publico()`; `auth.guard.spec.ts` migrado para `token.verifier.spec.ts` + e2e de login/ApiKey/BravoHub.

**Status: concluída.** Nomes em inglês, conforme a seção 2: `@Public()`, `@RequirePermissions()`, `@RequireActiveOrganization()`, `@User()`, `AuthenticatedUser`, `AccessScopeService.ensureCan`. Desvios e decisões: o único `@UseGuards` restante é `ThrottlerGuard` nas rotas de SMS (rate limit, não auth); `ActiveOrgGuard` virou o rótulo `@RequireActiveOrganization()` lido pelo `AuthorizationGuard`, aplicado às 4 rotas que o usavam, e a checagem por `agentId` foi para `ResolveAgentService`; o status da organização é lido pelo `PrincipalResolverService` com cache por `AUTH_PRINCIPAL_CACHE_TTL_MS`, invalidado por `Activate/DeactivateOrganization`; o modelo de permissões em tabela não entrou (catálogo em `src/auth/permissions.ts` com predicados sobre `role` e `org_role`); `GetSource`/`DeleteSource` não ganharam escopo porque `sources` não tem `organization_id` (fica para a Fase 5, junto com a coluna); `RevokeApiKey` já filtra por organização na query. Mudanças de comportamento: o token do BravoHub passa a ter só `chat.ask` (antes passava por qualquer rota com `AuthGuard`); `POST /agent/text-to-speech` e `/agent/generate-source` ficaram privados; rotas que exigiam `org_role` em `owner|admin|member` (qualquer JWT, inclusive `guest`) agora exigem `role` `admin|user`; `@RequireActiveOrganization()` passa a valer também para usuários com organização (antes só o caminho por `agentId` era checado). PCs registrados em `docs/problemas-conhecidos.md`.

### Fase 3 — Topologia e fronteiras

Dono das regras: `01`, `02`, `03`, `06`.

1. Mover `src/components/` para `src/modules/` com pastas kebab-case. Mapa de domínios (substantivo de negócio):

| Escopo atual | Domínio alvo | Observação |
| --- | --- | --- |
| `ArtificialIntelligence/CreateAgent`, `UpdateAgent`, `ListAgents`, `CreateAttendantAgent`, `LoadAgentSites` | `agents/` | CRUD de agente |
| `ArtificialIntelligence/ResolveAgent`, `GenerateAIResponse`, `BuildSystemPrompt`, `NormalizePromptInstructions`, `LoadCheckpointer`, `InvokeConnectionAgent`, `AppendConnectionTools` | `agent-runtime/` | auxiliares internos (só service + module) |
| `ArtificialIntelligence/ExecuteSimilaritySearch`, `LoadVectorStore`, `RerankDocuments`, `Tools/*` | `retrieval/` | auxiliares internos; `LoadDatabaseTool` e `LoadVectorSearchTool` incluídos |
| `ArtificialIntelligence/ConvertTextToSpeech` | `voice/` | |
| `AIChat/*` | `chat/` | `question`, `attendant`, `record-chat-message` |
| `Session/*` | `sessions/` | |
| `Source/*`, `Pdf/*`, `OCR/*` | `sources/` | `Pdf` e `OCR` são etapas de ingestão de fonte |
| `AgentConnection/*` | `agent-connections/` | |
| `Organization/*` (menos `Members`) | `organizations/` | |
| `Organization/Members/*` | `members/` | |
| `User/*`, `Register/*`, `Auth/*` | `users/` e `auth-flows/` | `auth-flows` guarda login, token, SMS, registro |
| `ApiKey/*` | `api-keys/` | |
| `Credits/*`, `Payment/*`, `TokenUsage/*` | `billing/` | `ManageCredits` como auxiliar interno |
| `Report/*`, `Dashboard/*`, `Analytics/*` | `reports/` | `Analytics/GetDashboardData` e `Dashboard/*` fazem a mesma coisa; consolidar |
| `Email/` | `notifications/enviar-email/` | auxiliar interno |
| `Whatsapp/*` | `whatsapp/` | |

2. Pastas de caso de uso em `<verbo>-<substantivo>` kebab-case (`criar-agente/` → mantido em inglês por decisão: `create-agent/`). Módulo agregador de domínio com `imports` e `exports` iguais; `AppModule` importa só agregadores; `components.module.ts` é removido.
3. Repositórios saem de `src/repositories/` para `src/modules/<dominio>/repositories/`, com o módulo ao lado; o barrel `src/repositories/index.ts` desaparece (hoje já é proibido em services pelo `CLAUDE.md`).
4. Entidades TypeORM saem de `src/entities/` para `src/infrastructure/database/schema/<tabela>.entity.ts` (imports relativos só dentro dessa pasta); `TypeOrmModule.forRoot` lista entidades pelo barrel do schema, sem glob de filesystem.
5. `src/types/models/*` migra para `src/modules/<dominio>/models/`; tipos derivados de entidade usam `Pick<>` sobre a entidade. `src/types/fastify.d.ts` fica em `src/types/`.
6. `src/utils/*` reparte-se: função de domínio puro vai para o domínio dono (`chunkText` → `sources/`, `buildZodSchema` → `retrieval/`, `apiKey` → `api-keys/`, `inviteToken` → `members/`); função transversal vai para `src/shared/`. Renomear para kebab-case. `src/services/cep.service.ts` vira integração na Fase 6.
7. `src/decorators/`, `src/observability/`, `src/health/` → `src/shared/decorators/`, `src/shared/observability/`, `src/shared/http/health/`.
8. Converter os 593 imports relativos em absolutos a partir de `src/` (codemod + regra de lint em `error`).
9. Fronteiras entre domínios: as 19 travessias entre escopos hoje são via módulo de caso de uso exportado e continuam permitidas. Quebrar os dois ciclos com `forwardRef` por porta em `contracts/`: `agent-runtime/contracts/tool-loader.port.ts` consumido por `ResolveAgent`, implementado por `LoadAgentTools`; `agent-connections/contracts/connected-agent-invoker.port.ts` consumido por `AppendConnectionTools`, implementado por `InvokeConnectedAgent`.
10. Tokens de infraestrutura passam a `Symbol` em `*.tokens.ts`; providers deixam de exportar `Provider[]` e viram módulos com `useFactory`; os que têm recurso com ciclo de vida (Supabase client, Stripe, Twilio, pool do checkpointer) implementam `OnApplicationShutdown`.
11. Atualizar `scripts/refactor-di/*` para os novos caminhos (ou aposentá-los após o `di:verify` final verde) e reescrever `.claude/rules/*.md` com os globs novos.

Pronto quando: `src/` tem só `main.ts`, `app.module.ts`, `auth/`, `infrastructure/`, `modules/`, `shared/`, `types/`; `bun run di:verify` verde; lint de kebab-case e imports absolutos em `error`.

**Status: concluída.** Desvios: `src/types/models` foi para `src/shared/contracts/` (barrel único) em vez de `models/` por domínio, porque os tipos serão redesenhados como `Pick<>` de entidade na Fase 5 e movê-los duas vezes é desperdício; `src/utils` foi inteiro para `src/shared/utils/` em kebab-case pelo mesmo motivo; nomes de classe não mudaram (só caminhos); `Dashboard/Charts` e `Dashboard/Statistics` viraram `reports/dashboard-charts` e `reports/dashboard-statistics`; `UniversalDataRepository` e `NotificationRepository` foram removidos por não terem consumidor; o único ciclo real (`ResolveAgent → LoadAgentTools → AppendConnectionTools → InvokeConnectedAgent → ResolveAgent`) foi cortado em `InvokeConnectedAgent` com o port `AGENT_RESOLVER`, publicado por um módulo `@Global()` com lookup lazy via `ModuleRef` em vez de `useExisting` (PC-008); tokens de infraestrutura viraram `Symbol` em `<recurso>.tokens.ts`; `LoadCheckpointerService` fecha o pool do `PostgresSaver` em `onApplicationShutdown`; a regra `import/no-relative-parent-imports` foi trocada por `no-restricted-imports` com padrões `./*` e `../*`, porque com o resolver TypeScript ela acusava os próprios imports absolutos `src/...`; `scripts/refactor-di` foi atualizado para a topologia nova e para módulos `@Global()`.

### Fase 4 — Caso de uso = endpoint; controller, service e DTO

Dono das regras: `02`, `04`, `05`.

1. Dividir `UpdateAgentController` em `list-agents` (já existe como `GET /agent/list`; eliminar a duplicata `GET /agent` ou redirecionar o front), `get-agent` (`GET /agent/:id`) e `update-agent` (`PATCH /agent/:id`). `UpdateAgentService` fica com um `execute()`.
2. Dividir `SendSmsController` em `send-sms` e `verify-sms`; `PublicEmbedController` em `get-embed-script` e `get-embed-page`.
3. Services com mais de um método público: `RerankDocumentsService`, `LoadPdfService`, `EmailService`, `SendSmsService`, `GenerateTokenService` → um caso de uso auxiliar por método ou métodos `private`.
4. Declarar tipo de retorno nos 20 `execute()` sem tipo; tipos de resposta em `models/` ou interface no próprio service (listagem).
5. Controllers sem `@Res` (`ConvertTextToSpeech`, `GetSource`, `Health`) passam a `@Res() res: FastifyReply` com `Promise<FastifyReply>`. Handlers chamados `execute` nos controllers são renomeados para `handle`.
6. DTOs: `@MaxLength` em toda string, `@ArrayMaxSize` em todo array, `@Type(() => Number)` em numérico de querystring, `@IsOptional()` primeiro, mensagens em português. DTO para os 13 handlers sem validação. Listagens ganham `page`/`limit` com os limites da regra.
7. Status HTTP: 201 em criação, 200 em leitura e atualização com corpo, 204 sem corpo. Hoje `register-lite` e `create-checkout` devolvem 200 em criação.
8. Swagger: `@ApiTags('<dominio>')` por controller e respostas possíveis por handler, com o plugin do `nest-cli` lendo `*.dto.ts`.
9. Ordem de decorators: verbo HTTP → `@ExigirPermissoes` → `@AcaoAuditoria` → Swagger.

Pronto quando: todo controller tem um único handler `handle()`; todo service um único `execute()` tipado; nenhum DTO com string sem `@MaxLength`.

**Status: concluída.** Decisões tomadas: `GET /agent` foi mantido como caso de uso próprio (`list-all-agents`, listagem administrativa com payload completo) em vez de removido, porque `GET /agent/list` devolve outro formato e o front pode depender dos dois; `GET /agent/:id` virou `get-agent` e `PATCH /agent/:id` ficou em `update-agent`; `verify-sms`, `get-embed-script` e `get-embed-page` viraram casos de uso próprios; `EmailService.send` virou `execute` e `sendWithTemplate` (sem consumidor) saiu; `LoadPdfService` ficou só com `execute(buffer)` (a variante por URL não tinha consumidor, e `axios` saiu das dependências); `GenerateTokenService.validateToken` (sem consumidor) saiu. Status HTTP: 201 em `create-attendant-agent`, `create-organization`, `sign-up`, `register-lite`, `create-checkout` e `convert-text-to-speech`; 204 sem corpo em `delete-agent-connection` e `remove-member`. `@MaxLength` com limites por heurística (255 em identificadores e nomes, 2048 em URLs, 10000 em textos longos, 128 em senhas) e `@ArrayMaxSize(100)` (50 em `sites`); mensagens de validação em português por campo ficaram de fora (a mensagem de topo do `ErrorResponse` já é em português; os `details` carregam a mensagem padrão do class-validator). Paginação das listagens ficou para a Fase 5, junto com a projeção nos repositórios. Os três specs placeholders que falhavam desde antes da Fase 0 (`ConvertTextToSpeech`, `Login`, `SignUp`) foram reescritos e passam.

### Fase 5 — Banco de dados (TypeORM com as regras de `09`)

Dono das regras: `09`, `05`, `06`.

1. Desligar `synchronize` e `autoLoadEntities`. Gerar uma migration baseline a partir do schema atual do Supabase (`migration:generate` contra um banco espelho), revisar e commitar. Daí em diante: alterar entidade → `migration:generate` → revisar `.ts`/SQL → commitar junto. Migration roda como passo isolado antes do deploy no workflow do Cloud Run, nunca no start. Registrar `documents`, `match_documents` e o índice pgvector como migration manual de baseline para que deixem de ser invisíveis.
2. Colunas de ciclo de vida: criar `colunasCicloDeVida` como classe abstrata TypeORM (`created_at`, `updated_at`, `deleted_at` com `@DeleteDateColumn`) e aplicá-la às 22 entidades. Migration aditiva para `organizations.created_at`, e `updated_at` em `credit_transactions`, `notifications`, `token_usage`. `token_usage`, `credit_transactions` e a futura `audit_logs` são trilhas: usam `registrado_em` e ficam fora da exclusão lógica.
3. Exclusão lógica: trocar os 5 `delete`/`remove` físicos por `softDelete`; toda leitura filtra `deleted_at IS NULL` (TypeORM faz isso com `@DeleteDateColumn`, mas `QueryBuilder` com `withDeleted` ou SQL cru exige filtro explícito). Os 9 índices únicos existentes passam a parciais (`WHERE deleted_at IS NULL`): `users.email`, `user_tokens.token`, `credit_balances.organization_id`, `agent_connections(principal_agent_id, child_agent_id)`, `organization_features(organization_id, feature_id)` e os de `features`, `plans`, `payments` e `subscriptions`. `api_keys.key_hash`, `organizations.chat_embed_token` e `agents.identifier` não têm índice único hoje e ganham um parcial.
4. Executor de transação: `src/infrastructure/database/executor-transacao/` com `executar(trabalho)` sobre `DataSource.transaction`; repositórios recebem `tx?: EntityManager` como último parâmetro e usam `tx ?? this.repository.manager`. Aplicar em `CreateOrganizationService` (organização + usuário + créditos via `ManageCredits`), `StripeWebhookService` (pagamento + saldo + ativação via services de outros domínios), `CreateAgentService` e `UpdateAgentService` (agente + instruções). Efeitos externos (e-mail, Stripe) ficam fora do callback.
5. Pool: `extra` do driver `pg` com `min`, `max`, `statement_timeout`, `query_timeout`, `idle_in_transaction_session_timeout`, `connectionTimeoutMillis`, `keepAlive`; listener de `error`; sonda no boot; TLS com `rejectUnauthorized: true` em produção (Supabase exige). `OnApplicationShutdown` fecha o `DataSource`. O checkpointer do LangGraph (`PostgresSaver`) deve reutilizar a mesma URL e fechar seu pool no shutdown.
6. Repositórios: remover os métodos passthrough `find(options)`, `findOne(options)`, `count(options)`; cada consulta vira método nomeado com filtro tipado. `MessageRepository` deixa de gerar embedding: a geração vai para um auxiliar `chat/gerar-embedding-mensagem/` chamado pelo service antes de `inserir`.
7. Projeção: métodos de listagem recebem `campos?: readonly TCampo[]` antes de `tx` e passam para `select`; services declaram `CAMPOS_*` com `as const satisfies` e devolvem a lista sem `map`. Alvo inicial: os 13 services que fazem `.map` sobre resultado de repositório (`ListAgents`, `ListApiKeys`, `ListSources`, `ListSessions`, `ListMembers`, `ListOrganizations`, `GetSessionMessages`, `Dashboard/*`).
8. Paginação `{ items, total, totalPages, page, limit }` com `count` em paralelo nas listagens que hoje devolvem tudo: agentes, api keys, fontes, sessões, mensagens de sessão, membros, organizações, transações de crédito, histórico de pagamento, relatórios.
9. Nomes de índice/único/check seguindo `<tabela>_<finalidade>_idx|_uq` e checks para invariantes (`api_keys.expires_at > created_at`, `organizations.status` com `deactivated_at`).

Pronto quando: `synchronize: false`; `migrations/` versionado; toda entidade estende `colunasCicloDeVida`; nenhum `delete(` físico fora de trilhas; nenhum service com `.map` sobre lista de repositório sem justificativa.

**Status: 5a (código) concluída; 5b (schema) preparada, aguardando janela.** A fase foi dividida porque o `synchronize: true` aponta para o Supabase de produção. 5a entregou: `TransactionExecutor` com `tx?` como último argumento das escritas, usado em `CreateOrganization` (organização + usuário + créditos), `StripeWebhook` (status do pagamento + créditos), `CreateAgent` e `UpdateAgent` (agente + instruções), com `ManageCreditsService` repassando `tx`; pool do `pg` configurado (`DATABASE_POOL_MIN/MAX`, `DATABASE_STATEMENT_TIMEOUT_MS`, `DATABASE_CONNECTION_TIMEOUT_MS`, `idle_in_transaction_session_timeout`, `keepAlive`); fim dos passthroughs `find/findOne/count(options)` nos repositórios de agente, instrução, relatório, mensagem, sessão e organização, substituídos por métodos nomeados; projeção por `fields` e paginação `{ items, total, totalPages, page, limit }` com `count` em paralelo em 11 listagens (`GET /agent`, `GET /agent/list`, `POST /api-key/list`, `GET /source`, `GET /conversation/sessions`, `POST /organization/members/list`, `GET /organization`, `GET /payment/transactions`, `GET /payment/history`, `GET /report`, `GET /user`); `MessageRepository` deixou de gerar embedding (vai para `RecordChatMessageService`); a consulta de sessões com subselects saiu do service para `SessionRepository.listSummariesPaginated`; dashboards passaram a contar no banco em vez de carregar linhas. Mudanças de contrato: todas as listagens acima trocaram de formato (antes devolviam array cru, `{ data }` ou `{ sessions, pagination }`); `GET /payment/transactions` e `GET /payment/history` trocaram `limit/offset` por `page/limit`; `GET /source` exige `agent_id` via validação (antes devolvia um objeto de erro com 200); `GET /report` para admin deixou de filtrar por `organization_id = null` e lista todas as organizações. `ListAgentConnections` ficou sem paginação (lista limitada pelo agente principal). 5b (schema) está no commit seguinte, pronta para rodar: `synchronize: false`; `MIGRATIONS` registradas no `AppModule` com `migrationsRun: false`; `data-source.ts` para o CLI e scripts `db:migrate`, `db:revert`, `db:show`, `db:generate`, `db:check`; três migrations escritas à mão: `AddLifecycleColumns` (`deleted_at` em 19 tabelas, `created_at`/`updated_at` em `organizations`, `updated_at` em `notifications`), `AddSourcesOrganizationId` (coluna, backfill a partir de `agents`, índice) e `PartialUniqueIndexes` (`transaction = false`; cria os 11 índices únicos parciais com `CONCURRENTLY` e só então derruba o constraint ou índice único antigo com o mesmo conjunto de colunas, inclusive os dois novos `api_keys.key_hash` e `organizations.chat_embed_token`); entidades com `@DeleteDateColumn`, `@Index` parcial no lugar de `unique: true`/`@Unique`; `softDelete` nos cinco repositórios que apagavam fisicamente; `GetSource` e `DeleteSource` com escopo por `sources.organization_id`; `/health/startup` responde 503 com migrations pendentes; job `migrate` no CI entre `ci` e `cd-prod`. **Antes de mesclar este commit:** rodar `bun run db:check` contra um espelho do banco para confirmar que o diff entidades × produção é só o das três migrations. `token_usage` e `credit_transactions` continuam sem `deleted_at` por serem trilhas. Não foi criada migration baseline: as três são deltas sobre o schema que o `synchronize` produziu.

### Fase 6 — Integrações externas atrás de porta

Dono das regras: `10`, `06`.

1. `src/infrastructure/integration/` com `integration.module.ts` `@Global()` publicando portas; `http-client/ResilientClient` (timeout por `AbortController`, retry com backoff só em GET/HEAD e 408/425/429/5xx, circuit breaker, SSRF guard com `env.HTTP_ALLOWED_HOSTS`, `redirect: 'error'`, correlação).
2. Migrar cada provider para `infrastructure/integration/<fonte>/` com `<fonte>.contracts.ts` (Zod do payload externo), `<fonte>.mappers.ts` + spec, e porta em `<fonte>.port.ts`:

| Fonte | Hoje | Porta | Observação |
| --- | --- | --- | --- |
| Stripe | `STRIPE_CLIENT` string + webhook lendo payload cru | `PAGAMENTOS` | contrato Zod dos eventos `checkout.session.completed`, `invoice.paid`, `customer.subscription.*`; mapeador → `Pagamento` interno |
| Twilio (SMS + WhatsApp) | `TWILIO_CLIENT` + webhook cru | `MENSAGERIA_SMS` | contrato do form do webhook |
| SendGrid | `SENDGRID_CLIENT` | `EMAIL` | `EmailService` vira o adaptador |
| Supabase (pgvector) | `SUPABASE_CLIENT` | `VECTOR_STORE` | mantém LangChain `SupabaseVectorStore` dentro do adaptador |
| Voyage embeddings / rerank | 2 tokens string | `EMBEDDINGS`, `RERANKER` | cota compartilhada: um único circuit breaker |
| Anthropic (`ChatAnthropic`) | `anthropic.provider.ts` | `MODELO_CHAT` | só a construção do modelo; o grafo LangGraph continua em `agent-runtime/` |
| Spider | `SPIDER_CLIENT` | `RASTREADOR_SITES` | contrato Zod da resposta |
| GCS, Google TTS, Google Vision | providers + `ImageAnnotatorClient` instanciado em módulo de caso de uso | `ARMAZENAMENTO`, `TEXTO_PARA_VOZ`, `OCR` | ElevenLabs implementa `TEXTO_PARA_VOZ` como segunda implementação, selecionada por `env.TTS_PROVIDER` |
| ViaCEP (`services/cep.service.ts`) | axios solto | `CEP` | mover ou apagar se nenhum caso de uso usa |
| `axios` em `load-pdf.service.ts`, `fetch` em `utils/getUrlBuffer.ts` | chamada direta | via `ResilientClient` | URL vem do usuário: SSRF guard obrigatório |

3. Modo mock: `env.INTEGRATION_MODE` (`mock` default fora de produção) com `MockConnector`/implementações fake de cada porta, usadas pelos e2e.
4. `LoadDatabaseTool`: manter a construção de `DataSource` por request, mas dentro de `infrastructure/integration/customer-database/` com allowlist de host/porta e timeout de statement vindos de `env`; a sanitização SQL (allow-list de verbo, deny regex, `LIMIT`) vira função pura com spec. Indicador de saúde por upstream em `/health/ready`, sem derrubar o boot quando não configurado.
5. Dependência opcional (ElevenLabs, Spider, LangSmith) devolve resultado discriminado (`available`), nunca lança no construtor. Hoje `StripeProvider` lança `Error` no `useFactory` se faltar chave.

Pronto quando: `grep -rE "axios|fetch\(" src/modules` vazio; todo SDK instanciado só em `infrastructure/integration/`; nenhum nome de campo externo (`CD_`, `object.data`, `MessageSid`) fora de `*.contracts.ts`/`*.mappers.ts`.

**Status: concluída.** `src/infrastructure/integration/` substituiu os onze `src/infrastructure/<sdk>/` (tokens + provider + provider.module): `integration.module.ts` `@Global()` publica doze portas em inglês (`PAYMENTS`, `MESSAGING`, `EMAIL`, `EMBEDDINGS`, `VECTOR_STORE`, `RERANKER`, `CHAT_MODEL`, `SITE_CRAWLER`, `FILE_STORAGE`, `TEXT_TO_SPEECH`, `OCR`, `CUSTOMER_DATABASE`), cada uma com adaptador live (`<fonte>/<fonte>-<porta>.gateway.ts`) e fake em memória (`mock/`), selecionados por `env.INTEGRATION_MODE`. Contratos Zod + mapeadores puros com spec para Stripe (sete eventos → união `PaymentEvent`), Twilio (form do webhook → `InboundWhatsappMessage`), Voyage (resposta do rerank) e Spider (documento). `http-client/` entrega `ResilientClient` (timeout por `AbortController`, retry com backoff + jitter só em GET/HEAD/OPTIONS e 408/425/429/5xx, `CircuitBreaker`, SSRF guard com allowlist `HTTP_ALLOWED_HOSTS`, `redirect: 'error'`, propagação de `x-request-id`), com specs; o reranker Voyage é o primeiro consumidor. `IntegrationHealthIndicator` expõe `READY | NOT_CONFIGURED | MOCK` por upstream em `/health/ready` sem afetar a prontidão; nenhum adaptador lança no construtor por falta de chave (503 na chamada). `LoadDatabaseTool` usa a porta `CUSTOMER_DATABASE` (allowlist de host, timeouts de `env`) e a sanitização virou `customer-database/sql-guard.ts` puro com o spec antigo migrado. `ChatAnthropic` só é construído em `anthropic-chat-model.factory.ts`; `ResolvedAgent.chat` passou a `BaseChatModel`. Removidos: `LoadVectorStoreService` (consumidores injetam `VECTOR_STORE`), `webhook.dto.ts` do WhatsApp (campos Twilio), `getUrlBuffer` (sem uso), wrappers de streaming/STT do ElevenLabs (sem consumidor; a porta tem só `synthesize`). Desvios conscientes: (a) `INTEGRATION_MODE` default `mock` só em `NODE_ENV=test`, `live` nos demais — a regra manda `mock` por padrão, mas isso quebraria todo `.env` de desenvolvimento existente; (b) portas nomeadas em inglês (decisão da seção 2); (c) SDKs (Stripe, Twilio, SendGrid, Supabase, LangChain, Google) mantêm o próprio HTTP, só chamadas manuais passam pelo `ResilientClient` (PC-013); por isso embeddings e rerank não partilham um circuit breaker; (d) `ANTHROPIC_BASE_URL` nasce com default no endpoint DeepSeek que estava hard-coded, para não mudar comportamento sem decisão explícita; (e) não foram criados `source-registry.ts`, `Normalizer` nem `provenance` — nenhuma integração atual coleta registros em lote, todas são chamadas imperativas (padrão "cliente imperativo" da regra); (f) o SSRF guard valida o hostname, não o IP resolvido por DNS. Mudanças de contrato: `DeleteSource` agora falha (em vez de só logar) quando o vector store rejeita a exclusão; o webhook do WhatsApp ignora formulários sem `WaId` em vez de criar usuário sem telefone; o webhook Stripe responde 400 a payload fora do contrato Zod. Verificado com `format:check`, `lint` (0 erros), `typecheck`, `build`, `di:verify`, `di:boot-check` e `jest` (37 suítes, 186 testes).

### Fase 7 — Tipagem, lint e comentários

Dono das regras: `01`, `02`.

1. `strictNullChecks: true` por diretório (ordem: `shared/`, `auth/`, `infrastructure/`, depois um domínio por PR), usando `tsconfig` com `include` crescente ou `// @ts-strict` por arquivo até cobrir tudo. Depois `noImplicitAny`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `strict`.
2. `@typescript-eslint/no-explicit-any` para `error`; eliminar os 149 `any` (prioridade: `request.user`, payloads de JWT, `error: any` nos controllers que somem com a Fase 1).
3. Promover `no-inline-comments`, `no-warning-comments`, kebab-case e imports absolutos para `error`; remover as 393 linhas de comentário (JSDoc decorativo, código comentado, cabeçalhos). Intenção de teste vai para o `it(...)`.
4. `import type` para tudo que é só tipo, exceto classe injetada por construtor sem `@Inject` (PC-006 do `12`).
5. Lint sem `--fix` no CI; `lint-staged` continua com `--fix` local.

**Status: concluída, em um passo em vez de por diretório.** Os 65 erros de `strictNullChecks`/`noImplicitAny` e os 361 de `strictPropertyInitialization` cabiam em uma rodada, então `tsconfig.json` passou direto a `strict: true` + `noImplicitOverride` + `noFallthroughCasesInSwitch` + `forceConsistentCasingInFileNames`, cobrindo também os specs (ts-jest compila com o mesmo tsconfig). Entidades e DTOs ganharam `!`; `AuthenticatedUser.id`/`organization_id` são nulos de verdade e os controllers que precisam deles chamam `requireUserId`/`requireOrganizationId` (403). `ResolvedAgent.id` virou obrigatório, `ResolvedAgent.chat` é `BaseChatModel`, `AgentTool = StructuredToolInterface` substituiu `DynamicStructuredTool<z.ZodObject<any>>` em todo o pipeline e `@langchain/langgraph` subiu para `^1.1.2` (a cópia 0.3.12 na raiz divergia da que o `langchain@1.x` usa, e `MemorySaver` deixava de ser um `BaseCheckpointSaver`). `@typescript-eslint/no-explicit-any` é `error` (os 67 usos foram eliminados; `*.spec.ts` continuam liberados até a Fase 8 migrar os specs de service para e2e); `no-inline-comments` e `no-warning-comments` são `error`; `consistent-type-imports` + `no-import-type-side-effects` impõem `import type`. Os 117 comentários de `src/` foram removidos por `scripts/lint/no-comments.ts` (baseado no parser do TypeScript; `bun run lint` termina com `lint:comments`), e o conhecimento que carregavam foi para `docs/decisoes-de-dominio.md`. `noUncheckedIndexedAccess` **não** entrou (82 erros, quase todos indexações legítimas em arrays já verificados) — fica como item explícito para depois. Desvios documentados: `isolatedModules` desligado (PC-014), casts em `Repository.update` (PC-015), em `adapter.register` (PC-016) e nos tipos duplos do LangChain (PC-012). CI já rodava `eslint` sem `--fix`. Verificado com `format:check`, `lint` (0 erros, 0 avisos), `typecheck`, `build`, `di:verify`, `di:boot-check` e `jest` (37 suítes, 186 testes).

### Fase 8 — Testes

Dono das regras: `05`.

1. `test/` com bootstrap Testcontainers (Postgres + pgvector) reaproveitando `createFastifyAdapter()` e `createValidationPipe()`; migrations aplicadas no setup. Mocks das portas de integração via `INTEGRATION_MODE=mock`.
2. Um `test/<dominio>.e2e-spec.ts` por domínio cobrindo cada caso de uso: caminho feliz, erro de validação, 401 sem token, 403 sem permissão, 404. Ordem de implementação: `auth-flows` → `organizations` → `members` → `api-keys` → `agents` → `sources` → `chat` (com modelo mock) → `billing` (webhook Stripe com payload de contrato) → `reports`.
3. Specs unitários só para função pura: mapeadores de integração, sanitização SQL do `LoadDatabaseTool`, `chunkText`, `buildZodSchema`, `TokenVerifier`, `AccessScopeService`, cálculo de permissões efetivas. Specs de service com mock de repositório são migrados para e2e ou removidos.
4. CI: `test` e `test:e2e` obrigatórios no PR; Testcontainers roda no runner Ubuntu com Docker.

**Status: concluída.** `test/` ganhou a harness completa: `global-setup.ts` resolve o banco por `TEST_DATABASE_URL` e cai para `@testcontainers/postgresql` quando há Docker; `scripts/test/prepare-database.ts` (ts-node/CommonJS) sincroniza o schema a partir das entidades e marca as três migrations como aplicadas (não há baseline — PC-017); `test/support/test-app.ts` sobe o `AppModule` real em Fastify reusando `createFastifyAdapter()` e `createValidationPipe()`; `test/support/factories.ts` cria plano, organização, usuário (com `bcrypt`), agente com instruções, conexão, fonte, sessão, mensagem, relatório, saldo e chave de API, e assina JWT nativo com `tokenFor`/`bearer`; cada spec trunca todas as tabelas no `beforeEach`. Treze arquivos e2e (`health`, `auth-flows`, `organizations`, `members`, `api-keys`, `agents` com conexões, `sources`, `chat`, `billing`, `reports`, `sessions`, `users`, `voice-and-whatsapp`), 61 testes, cobrindo cada caso de uso com caminho feliz, 400 com `details`, 401, 403 e 404 — inclusive o streaming NDJSON de `/support/question` com `FakeListChatModel`, o webhook Stripe com payload do contrato (pagamento → créditos → organização ativada), ingestão de site e de arquivo via multipart com os mocks de crawler e vector store, e autenticação por `ApiKey` limitada a `chat.ask`. Os specs de service com mock de repositório foram removidos (create-agent, login, sign-up, generate-token, principal-resolver, convert-text-to-speech, generate-agent-source, load-pdf e os placeholders "should be defined"); ficaram os puros (mappers, `sql-guard`, http-client, permissions, access-scope, token.verifier, utils, `VoyageRerankCompressor`) e os dois specs de módulo Nest sem banco (`auth-layer`, `http-layer`): 24 suítes, 153 testes. CI: o job `ci` ganhou um `postgres:16-alpine` como service container e o passo `test:e2e`; `docker-compose.yml` ganhou o `postgres` para rodar localmente. Bugs encontrados pelos e2e e corrigidos: `@MaxLength(2048)` sem `each: true` em `sites` (impedia qualquer agente de receber sites por create/update), `MemoryHealthIndicator` comparando `heapUsed/heapTotal` (reportava `down` em processos saudáveis), `DevtoolsModule` vivo em teste (PC-018), `created_by` sem UUID nos exemplos. Desvio: a regra pede Testcontainers; o CI usa service container do GitHub Actions (mesmo Postgres, sem Docker-in-Docker) e Testcontainers fica como fallback local. Lacuna conhecida: roteamento de PDF/DOCX em `GenerateAgentSource` não tem e2e (exigiria binários reais); a detecção de tipo continua coberta por `detect-file-kind.spec.ts`.

### Fase 9 — Documentação e governança

Dono das regras: `11`, `12`, `CLAUDE.md` de `docs/backend`.

1. Reescrever `CLAUDE.md` do `split-ai` apontando para `ai-agents-engineering/docs/backend/rules/` como especificação, mantendo só o que é específico do produto (pipeline de IA, Voyage, Supabase, Cloud Run) e a lista de desvios conscientes da seção 2 deste plano.
2. Criar `docs/problemas-conhecidos.md` no modelo `PC-NNN` de `12` com as travas já conhecidas: `ContextualCompressionRetriever` só em `@langchain/classic`; cast `BaseRetrieverInterface` load-bearing sob `NodeNext`; TDZ de `emitDecoratorMetadata` ao rodar scripts TypeORM sob bun; cota Voyage 3 RPM sem cartão default; `res.hijack()` fora do alcance do filtro global; `forwardRef` nos ciclos (resolvido na Fase 3); `JwtService` com `secret` por chamada.
3. Atualizar `.claude/rules/*.md` e `.claude/skills/*` para os caminhos novos; apagar o que repete regra já coberta em `rules/`.
4. Novo caso de uso passa a seguir `11-fluxo-de-raciocinio-nova-funcionalidade.md` (18 perguntas, plano, ordem de implementação).

**Status: concluída.** `CLAUDE.md` foi reescrito em torno da especificação: aponta para `ai-agents-engineering/docs/backend/rules/` com uma tabela "arquivo da regra → o que ela governa → o que muda aqui", traz a tabela de tradução de nomes (regra em português → identificador em inglês: `@Publico()` → `@Public()`, `garantirPode` → `ensureCan`, `executor-transacao` → `TransactionExecutor`, `colunasCicloDeVida` → colunas declaradas por entidade, conectores → gateways/mocks), a tabela de desvios conscientes (TypeORM, bun, Jest, JWT próprio, inglês, sem prefixo, permissões derivadas, `INTEGRATION_MODE`, `ResilientClient` só em HTTP manual, `isolatedModules` off, `noUncheckedIndexedAccess` off, sem baseline) e só o que é específico do produto: invariantes de auth/paginação/transação/soft delete, integrações, pipeline de IA, feature de banco por organização, testes, "things that bite" e CI. `docs/problemas-conhecidos.md` já existia desde a Fase 1 e fechou com PC-001…PC-018, todos os itens listados neste plano incluídos (`ContextualCompressionRetriever` em `@langchain/classic` e o cast load-bearing em PC-005/PC-012, TDZ do bun em PC-006, cota Voyage em PC-007, `res.hijack()` fora do filtro em PC-003, `forwardRef` resolvido por porta em PC-008, JWT próprio em PC-001). Skills gerais (`architecture`, `code-patterns`, `import-and-naming-conventions`) foram reduzidas ao delta sobre as regras `01`–`06` (tabela "onde fica cada coisa", receitas de módulo/repositório/gateway, templates com os nomes reais, mapa de exceções) em vez de repetir as regras; as skills de IA, `tech-stack` e `eleven-labs` tiveram as referências antigas corrigidas (`config.*` → `env.*`, `AIChat/`/`ArtificialIntelligence/`/`Source/` → `src/modules/<domínio>/`, `synchronize: true`, `forwardRef`, `console.*`, grafo de módulos reescrito com os aggregators e portas atuais, seção de código morto zerada). Governança: `.github/pull_request_template.md` carrega o checklist da Parte 4 da regra `11` adaptado ao repositório, e `CLAUDE.md` exige a regra `11` (18 perguntas + plano antes do código) para toda funcionalidade nova. Não entrou: regra de `@AcaoAuditoria`/`EVENT_PUBLISHER`/`audit_logs`, que a regra `07`/`10` prevê e o produto não tem — registrado na tabela de tradução como "não implementado".

---

## 5. Ordem, dependências e esforço

| Fase | Depende de | Paraleliza com | Esforço estimado | Risco de regressão |
| --- | --- | --- | --- | --- |
| 0 Higiene | — | todas | 2 a 3 dias | baixo (sem mudança de comportamento, exceto boot falhando por env inválido) |
| 1 Transversais | 0 | 2, 7 | 4 a 6 dias | médio: formato de erro muda para todos os clientes; pipe global com `whitelist` pode rejeitar campos extras hoje aceitos |
| 2 Auth | 0, 1 | 7 | 5 a 8 dias | alto: toda rota muda de guard; exige e2e de auth antes de remover os guards antigos |
| 3 Topologia | 2 | 7 | 5 a 8 dias (codemod + revisão) | baixo em runtime, alto em conflito de merge: congelar outras branches durante a movimentação |
| 4 Caso de uso | 3 | 7 | 4 a 6 dias | médio: rotas duplicadas (`GET /agent`) e status HTTP mudam |
| 5 Banco | 3 | 6 | 8 a 12 dias | alto: baseline de migration contra produção; exclusão lógica muda semântica de unicidade |
| 6 Integrações | 3 | 5 | 6 a 10 dias | médio: webhooks passam por contrato Zod e podem rejeitar eventos desconhecidos |
| 7 Tipagem/lint | 0 | todas | contínuo, 1 dia por domínio | baixo |
| 8 Testes | 1, 2, 5, 6 | — | 8 a 12 dias | baixo |
| 9 Documentação | 3 | — | 1 a 2 dias | nenhum |

Total aproximado: 9 a 13 semanas de uma pessoa, ou 5 a 7 semanas com duas pessoas (uma em 1→2→4, outra em 0→3→5/6), com a Fase 3 como ponto de sincronização obrigatório.

---

## 6. Métricas de pronto

Medidas em 2026-10-04, após a Fase 9, com `grep` sobre `src/` e `test/`.

| Métrica | Baseline | Alvo | Resultado |
| --- | --- | --- | --- |
| `process.env` fora de `env.ts` | 7 | 0 | 0 |
| Imports relativos | 593 | 0 | 0 (exceto `infrastructure/database/schema/`, permitido) |
| Controllers com `try/catch` | 62 | 2 (streaming, documentados) | 1 (`QuestionController`, PC-003) |
| Formatos distintos de corpo de erro | 12 | 1 (`ErrorResponse`) | 1 |
| Controllers com `@UseGuards` | 51 | 0 | 0 (`ThrottlerGuard` em SMS é rate limiting) |
| Rotas sem `@RequirePermissions`/`@Public()` | 66 | 0 | 0 |
| Handlers com `@Body()` sem validação | 13 | 0 | 0 (pipe global; webhooks/multipart leem `req.body` por contrato) |
| DTOs com string sem `@MaxLength` | 25 | 0 | 0 |
| Controllers com mais de um handler | 3 | 0 | 0 |
| Services com mais de um método público | 6 | 0 | 0 |
| `execute()` sem tipo de retorno | 20 | 0 | 0 |
| Entidades sem `deleted_at` | 22 | 0 (exceto trilhas) | 2 (`token_usage`, `credit_transactions`) |
| `delete`/`remove` físico em repositório | 5 | 0 (exceto trilhas) | 0 |
| `synchronize: true` | sim | não; migrations versionadas | não; 3 migrations (5b aguarda janela) |
| Chamadas de rede fora de `infrastructure/integration/` | 3 arquivos | 0 | 0 |
| Ciclos com `forwardRef` | 2 | 0 | 0 |
| Dependências sem import | 30+ | 0 | 0 (`di:verify` + `di:boot-check` no CI local) |
| `console.*` | 10 | 0 | 0 (o único `console.warn` é JS de browser dentro do template do widget) |
| `any` | 149 | 0 | 0 fora de `*.spec.ts` |
| Linhas de comentário | 393 | 0 | 0 (`lint:comments`) |
| Rotas de health | 1 | 3 | 3 |
| Testes e2e | 1 placeholder | 1 por caso de uso (66) | 62 `it(...)` em 13 arquivos, cobrindo os 66 endpoints (vários `it` exercitam mais de um caso de uso do mesmo domínio) |

---

## 7. Riscos e dúvidas em aberto para o solicitante

1. **Trocar TypeORM por Drizzle?** O plano assume que não. A troca exige reescrever 22 entidades, 22 repositórios, o `PostgresSaver` do LangGraph continua precisando de `pg`, e o `synchronize` desaparece de qualquer forma na Fase 5. Custo adicional estimado: 3 a 4 semanas. Decidir antes da Fase 5.
2. **Identificadores em português?** O plano mantém inglês. Confirmar.
3. **Prefixo global `/api`?** Quebra widget, BravoHub e health do Cloud Run. O plano não adota. Confirmar.
4. **`POST /agent/text-to-speech` e `POST /agent/generate-source` são públicos hoje.** O plano os torna privados. Confirmar se algum cliente depende disso.
5. **`GET /agent` (em `UpdateAgentController`) e `GET /agent/list` coexistem.** Qual o front usa? O plano remove `GET /agent`.
6. **`forbidNonWhitelisted` nos webhooks Stripe/Twilio** pode rejeitar eventos com campos novos. O plano usa contrato Zod por evento e ignora eventos não mapeados com log `warn`. Confirmar a lista de eventos Stripe que o produto trata.
7. **Baseline de migration contra o Supabase de produção.** Precisa de um banco espelho (dump de schema) e janela para rodar a primeira migration de `deleted_at`/`updated_at`. Quem executa e quando?
8. **Rotação dos segredos do `.env` versionado.** Fora do escopo do código, mas bloqueia a Fase 0 item 2.
9. **Modelo de permissões em tabela** (`papeis`/`permissoes`/exceções de `08`): não adotado nesta rodada; derivação fixa de `org_role`. Reavaliar quando houver requisito de permissão por recurso ou por unidade.
10. **Auditoria (`AuditInterceptor` + tabela)**: incluída na Fase 1 item 9, mas cria tabela e volume de escrita por request. Confirmar se entra agora ou após a Fase 5.
11. **Travas de biblioteca aplicáveis** (`12`): PC-002 (metadata de decorator em test runner) vale para ts-jest com `isolatedModules`; PC-006 (`import type` em dependência de construtor) vale ao ativar `consistent-type-imports` na Fase 7; PC-005 (rota direta no Fastify fora dos guards) vale para o Swagger UI e para `res.hijack()`.
