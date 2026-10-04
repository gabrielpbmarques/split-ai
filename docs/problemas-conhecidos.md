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
| Solução | Manter a emissão em `src/modules/Auth/`. A verificação continua concentrada em `TokenVerifier` (`src/auth/token.verifier.ts`), que é a única classe que conhece o formato do token. Nunca criar flag ou variável que desligue a verificação. |
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
| Onde | `src/infrastructure/voyage-rerank/voyage-*.provider.ts` |
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
