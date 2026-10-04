# Problemas conhecidos

Registro de travas, contornos e desvios conscientes do `split-ai` em relação a `ai-agents-engineering/docs/backend/rules`. Modelo e protocolo: [`12-problemas-conhecidos.md`](../../ai-agents-engineering/docs/backend/rules/12-problemas-conhecidos.md). Toda trava investigada entra aqui, resolvida ou não.

## Registro

### PC-001 — A aplicação emite o próprio JWT (não é Resource Server)

| Campo | Valor |
| --- | --- |
| Status | sem-solucao |
| Biblioteca | `jsonwebtoken@9.0.3` |
| Sintoma | `POST /auth/login`, `/auth/register-lite`, `/auth/send-sms`, `/auth/verify-sms` e `/sign-up` emitem tokens; `GenerateTokenService` assina com `env.JWT_SECRET`. |
| Causa | O produto não tem IdP externo; o backend é o emissor. |
| Solução | Manter a emissão em `src/modules/auth-flows/`. A verificação continua concentrada em `TokenVerifier` (`src/auth/token.verifier.ts`), que é a única classe que conhece o formato do token. Nunca criar flag ou variável que desligue a verificação. |
| Onde | `src/auth/token.verifier.ts`, `src/modules/auth-flows/generate-token/` |
| Regra dona | `08-autenticacao-autorizacao.md` |
| Tentativas descartadas | — |
| Remover quando | Houver IdP externo (Auth0, Cognito, Supabase Auth) emitindo os tokens. |
| Registrado em | 2026-10-04 |

### PC-002 — Token do BravoHub aceito como principal de serviço

| Campo | Valor |
| --- | --- |
| Status | atalho |
| Biblioteca | `jsonwebtoken@9.0.3` |
| Sintoma | Um JWT HS512 assinado com `BRAVOHUB_JWT_SECRET` (claim `user.company_id`) autentica como `role: 'service'` na organização `BRAVOHUB_ORG_ID`, com `companyId` usado como escopo das consultas SQL. |
| Causa | O dashboard do BravoHub chama `/support/question` com o token da própria plataforma. |
| Solução | Verificação em `TokenVerifier.verifyBravohubJwt`, só após o JWT nativo falhar. O principal recebe apenas `chat.ask`; antes da Fase 2 ele passava por qualquer rota com `AuthGuard` sem checagem de papel. |
| Onde | `src/auth/token.verifier.ts`, `src/auth/principal-resolver.service.ts` |
| Regra dona | `08-autenticacao-autorizacao.md` |
| Tentativas descartadas | — |
| Remover quando | O BravoHub passar a usar uma API key da organização (`Authorization: ApiKey`). |
| Registrado em | 2026-10-04 |

### PC-003 — Resposta em streaming fica fora do filtro global de exceção

| Campo | Valor |
| --- | --- |
| Status | contornado |
| Biblioteca | `@nestjs/platform-fastify@10.4.22` |
| Sintoma | Depois de `res.hijack()` e `writeHead(200)`, uma exceção não pode virar `ErrorResponse`: os headers já foram enviados. |
| Causa | `POST /support/question` envia NDJSON em chunks e precisa do socket cru. |
| Solução | `QuestionController` mantém o único `try/catch` do projeto e escreve um evento `{ type: 'error' }` seguido de `{ type: 'done' }`. `GlobalExceptionFilter` ignora respostas com `headersSent`. |
| Onde | `src/modules/chat/question/question.controller.ts`, `src/shared/http/exception.filter.ts` |
| Regra dona | `07-interceptors-decorators.md` |
| Tentativas descartadas | — |
| Remover quando | O streaming migrar para SSE nativo do Nest com um interceptor de erro próprio. |
| Registrado em | 2026-10-04 |

### PC-004 — CORS aberto e helmet sem CSP por causa do widget público

| Campo | Valor |
| --- | --- |
| Status | atalho |
| Biblioteca | `@fastify/helmet@11`, `@fastify/cors@10.1.0` |
| Sintoma | `chat.js` e a página `/public/embed/chat` são carregados em domínios de clientes e em iframe; `frame-ancestors`, `X-Frame-Options` e allowlist de origem quebram o widget. |
| Causa | O produto expõe um widget embutível em qualquer site. |
| Solução | `createFastifyAdapter()` registra helmet com `contentSecurityPolicy`, `frameguard` e `crossOriginResourcePolicy` desligados. `ALLOWED_ORIGINS` vazio reflete qualquer origem; preenchido, restringe; `*` é rejeitado pelo schema. |
| Onde | `src/shared/http/fastify-adapter.ts`, `src/shared/config/env.ts` |
| Regra dona | `01-topologia.md` |
| Tentativas descartadas | Allowlist global: bloqueia o widget em sites de clientes. |
| Remover quando | As rotas públicas do widget tiverem CORS próprio (registro encapsulado no Fastify) e as rotas autenticadas usarem allowlist. |
| Registrado em | 2026-10-04 |

### PC-005 — `ContextualCompressionRetriever` só existe em `@langchain/classic`

| Campo | Valor |
| --- | --- |
| Status | contornado |
| Biblioteca | `langchain@1.2.24`, `@langchain/classic@1.0.17`, `@langchain/community@0.3.59` |
| Sintoma | `Module '"langchain"' has no exported member 'ContextualCompressionRetriever'`; e sem o cast `as unknown as BaseRetrieverInterface` o `bun run build` falha porque `@langchain/community` resolve as tipagens CJS para as ESM sob `NodeNext`. |
| Causa | Os retrievers clássicos mudaram de pacote na v1; duas identidades do mesmo tipo. |
| Solução | Importar de `@langchain/classic` e manter o cast em `execute-similarity-search.service.ts`. |
| Onde | `src/modules/retrieval/execute-similarity-search/execute-similarity-search.service.ts` |
| Regra dona | — |
| Tentativas descartadas | Remover o cast: quebra o build. |
| Remover quando | `@langchain/community` publicar tipagens ESM/CJS unificadas. |
| Registrado em | 2026-10-04 |

### PC-006 — Scripts TypeORM sob o loader ESM do bun disparam TDZ de `emitDecoratorMetadata`

| Campo | Valor |
| --- | --- |
| Status | contornado |
| Biblioteca | `bun@1.3`, `typeorm@0.3.28` |
| Sintoma | `ReferenceError: Cannot access 'X' before initialization` ao rodar `scripts/seed-maia.ts` com `bun run` direto. |
| Causa | Entidades com relações circulares dependem da ordem de avaliação do metadata de decorators, diferente no loader ESM do bun. |
| Solução | Rodar via `ts-node` em CommonJS (`bun run seed:maia`, `bun run repair:thread`). |
| Onde | `package.json` (scripts `seed:maia`, `repair:thread`, `di:boot-check`) |
| Regra dona | — |
| Tentativas descartadas | — |
| Remover quando | As entidades saírem do TypeORM ou o bun alinhar a semântica de decorators. |
| Registrado em | 2026-10-04 |

### PC-007 — Cota Voyage de 3 RPM sem cartão padrão

| Campo | Valor |
| --- | --- |
| Status | sem-solucao |
| Biblioteca | `@langchain/community@0.3.59` (`VoyageEmbeddings`), reranker próprio |
| Sintoma | 429 com corpo `"You have not yet added your payment method"`; cada busca custa duas chamadas (embed + rerank) na mesma chave. |
| Causa | Limite por organização Voyage; um cartão cadastrado sem ser o padrão não conta. |
| Solução | Definir cartão padrão na conta Voyage e validar com rajada de chamadas concorrentes, não pelo dashboard. |
| Onde | `src/infrastructure/integration/voyage/` |
| Regra dona | `10-integracoes-externas.md` |
| Tentativas descartadas | — |
| Remover quando | — |
| Registrado em | 2026-10-04 |

### PC-008 — `useExisting` em porta não quebra ciclo de instanciação do Nest

| Campo | Valor |
| --- | --- |
| Status | atalho |
| Biblioteca | `@nestjs/core@10.4.22` |
| Sintoma | Mesmo sem ciclo entre módulos, `{ provide: AGENT_RESOLVER, useExisting: ResolveAgentService }` reabre o ciclo na instanciação (`ResolveAgentService → LoadAgentToolsService → AppendConnectionToolsService → InvokeConnectedAgentService → AGENT_RESOLVER → ResolveAgentService`) e o Nest exige `forwardRef`. |
| Causa | O grafo de objetos do pipeline de agentes conectados é cíclico por construção: um agente resolve seus sub-agentes com o mesmo serviço. |
| Solução | A porta é provida por `useFactory` com `ModuleRef` e resolve `ResolveAgentService` só no momento da chamada (`moduleRef.get(..., { strict: false })`), em módulo `@Global()`. O consumidor injeta pelo token e tipa pela interface; nenhum `forwardRef` sobra. |
| Onde | `src/modules/agent-runtime/contracts/agent-runtime-contracts.module.ts` |
| Regra dona | `06-injecao-dependencia.md` |
| Tentativas descartadas | `useExisting`: erro de dependência circular no boot. `forwardRef` nos dois lados: proibido pela regra e esconde o acoplamento. |
| Remover quando | A resolução do sub-agente for feita por um orquestrador acima de `ResolveAgentService`, eliminando a recursão. |
| Registrado em | 2026-10-04 |

### PC-009 — ts-jest perde o `esModuleInterop` implícito de `module: nodenext`

| Campo | Valor |
| --- | --- |
| Status | contornado |
| Biblioteca | `ts-jest@29.4.6`, `typescript@5.9.3` |
| Sintoma | `TypeError: Cannot read properties of undefined (reading 'join')` em `import path from 'path'` (e `reading 'hash'` em `import bcrypt from 'bcryptjs'`) só dentro do Jest; a aplicação compilada funciona. |
| Causa | Com `module: nodenext` o TypeScript implica `esModuleInterop`; o ts-jest recompila com `module: commonjs` e a implicação some, então o import default de um módulo CommonJS vira `require('path').default`. |
| Solução | `esModuleInterop: true` explícito em `tsconfig.json`. Sem efeito no build (já era o comportamento implícito). |
| Onde | `tsconfig.json` |
| Regra dona | — |
| Tentativas descartadas | Trocar os imports para `import * as path` arquivo a arquivo: resolve caso a caso e volta a quebrar no próximo import default. |
| Remover quando | O Jest rodar em modo ESM ou o ts-jest respeitar `module: nodenext`. |
| Registrado em | 2026-10-04 |

### PC-010 — `CREATE INDEX CONCURRENTLY` não roda dentro da transação da migration

| Campo | Valor |
| --- | --- |
| Status | contornado |
| Biblioteca | `typeorm@0.3.28`, PostgreSQL 15 |
| Sintoma | `ERROR: CREATE INDEX CONCURRENTLY cannot run inside a transaction block` ao criar índice em migration. |
| Causa | O TypeORM envolve cada migration em uma transação por padrão. |
| Solução | Declarar `transaction = false` na classe da migration (suportado pela `MigrationInterface` do 0.3) e manter nela só comandos idempotentes (`IF NOT EXISTS`, `IF EXISTS`), porque sem transação uma falha no meio não desfaz os passos anteriores. |
| Onde | `src/infrastructure/database/migrations/1759600002000-partial-unique-indexes.ts` |
| Regra dona | `09-banco-de-dados.md` |
| Tentativas descartadas | Criar o índice sem `CONCURRENTLY`: bloqueia escrita na tabela durante a criação. |
| Remover quando | — |
| Registrado em | 2026-10-04 |

### PC-011 — `migration:generate` exige um banco acessível

| Campo | Valor |
| --- | --- |
| Status | sem-solucao |
| Biblioteca | `typeorm@0.3.28` |
| Sintoma | `db:generate` e `db:check` não funcionam no ambiente de desenvolvimento remoto sem rede para o Postgres; o diff é calculado contra o banco, não contra o histórico de migrations. |
| Causa | O TypeORM não mantém snapshot de schema; compara entidades com o banco vivo. |
| Solução | Rodar `db:generate`/`db:check` contra um Postgres local restaurado de um dump de schema do Supabase (`pg_dump --schema-only`). Nunca apontar `db:generate` para produção. As migrations da Fase 5 foram escritas à mão a partir das entidades e devem ser validadas com `db:check` nesse espelho antes do merge. |
| Onde | `package.json` (`db:generate`, `db:check`) |
| Regra dona | `09-banco-de-dados.md` |
| Tentativas descartadas | — |
| Remover quando | — |
| Registrado em | 2026-10-04 |

### PC-012 — `@langchain/community` e `@langchain/core` com identidades duplas sob `NodeNext`

| Campo | Valor |
| --- | --- |
| Status | atalho |
| Biblioteca | `@langchain/community@0.3.59`, `@langchain/core@1.1.x`, TypeScript `module: nodenext` |
| Sintoma | `SupabaseVectorStore` não é atribuível a `VectorStoreInterface` e `VoyageEmbeddings` não é atribuível a `Embeddings`: "Property 'maxConcurrency' is protected but type 'AsyncCaller' is not a class derived from 'AsyncCaller'". |
| Causa | `@langchain/community` resolve os tipos de `@langchain/core` pela entrada CJS (`resolution-mode: import` vs `require`), então a mesma classe aparece duas vezes para o compilador. Mesma raiz do PC-005. |
| Solução | Dois casts `as unknown as` dentro dos adaptadores (`supabase-vector-store.gateway.ts` → `VectorStoreInterface`; `voyage-embeddings.factory.ts` → `Embeddings`). O domínio só vê os tipos de `@langchain/core`. |
| Onde | `src/infrastructure/integration/supabase/`, `src/infrastructure/integration/voyage/` |
| Regra dona | `10-integracoes-externas.md` |
| Tentativas descartadas | Tipar a porta com `SupabaseVectorStore`: vaza o SDK para `src/modules/` e impede o mock com `MemoryVectorStore`. |
| Remover quando | `@langchain/community` publicar tipos resolvidos contra a mesma entrada de `@langchain/core` que o projeto usa, ou o projeto deixar `nodenext`. |
| Registrado em | 2026-10-04 |

### PC-013 — Chamadas via SDK não passam pelo `ResilientClient`

| Campo | Valor |
| --- | --- |
| Status | sem-solucao |
| Biblioteca | `stripe`, `twilio`, `@sendgrid/mail`, `@supabase/supabase-js`, `@langchain/anthropic`, `@langchain/community` (`VoyageEmbeddings`, `SpiderLoader`), `@google-cloud/*`, `@elevenlabs/elevenlabs-js` |
| Sintoma | A regra `10` exige timeout, retry, circuit breaker e SSRF guard em toda chamada externa. Só o reranker Voyage (único `fetch` manual) usa `ResilientClient`; os demais adaptadores delegam o HTTP ao SDK, com os timeouts/retries do próprio SDK. Em particular embeddings e rerank partilham a cota Voyage mas não partilham o circuit breaker. |
| Causa | Os SDKs encapsulam autenticação, assinatura de webhook, paginação e streaming; reescrevê-los sobre `fetch` custaria mais do que o ganho e perderia a verificação de assinatura do Stripe. |
| Solução | Aceito: a porta isola o SDK no adaptador, `state()` + `/health/ready` expõem a configuração, e qualquer novo endpoint HTTP sem SDK nasce sobre `ResilientClient`. Timeouts dos SDKs ficam nos defaults. |
| Onde | `src/infrastructure/integration/<fonte>/*.gateway.ts` |
| Regra dona | `10-integracoes-externas.md` |
| Tentativas descartadas | — |
| Remover quando | Houver incidente de dependência externa travando requests (então configurar timeout/retry por SDK) ou quando uma fonte for migrada para chamada HTTP direta. |
| Registrado em | 2026-10-04 |
