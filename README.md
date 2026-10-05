# split-ai

Motor de IA pessoal em NestJS 11 + Fastify 5: chat com agentes (LangChain / LangGraph + Anthropic Claude), agentes como ferramentas de outros agentes, ingestão de fontes (sites, PDF, DOCX, OCR), busca semântica (Voyage AI + Supabase pgvector), consulta a banco externo por agente, voz e WhatsApp. Uma instalação, poucos usuários, sem organizações nem cobrança.

## Requisitos

- [bun](https://bun.sh) 1.3+
- PostgreSQL (o projeto usa Supabase; o vector store `documents` + `match_documents` vive só lá)
- Credenciais dos provedores usados (ver `.env.example`)

## Primeiros passos

```bash
bun install
cp .env.example .env     # preencher DATABASE_URL e JWT_SECRET no mínimo
bun run start:dev        # http://localhost:4000
```

O schema de ambiente fica em `src/shared/config/env.ts`. Variável obrigatória ausente ou valor inválido derruba o boot listando todos os problemas. Variável nova: adicionar ao schema e ao `.env.example`.

## Comandos

```bash
bun run start:dev        # modo watch
bun run start:prod       # roda dist/main
bun run build            # nest build → dist/
bun run format:check     # prettier --check
bun run lint             # eslint (sem --fix)
bun run lint:fix         # eslint --fix
bun run typecheck        # tsc --noEmit
bun run test             # jest (unitários)
bun run test:e2e         # e2e contra um Postgres (TEST_DATABASE_URL ou `docker compose up postgres`)
bun run di:verify        # confere se cada módulo importa o que seus providers injetam
bun run di:boot-check    # monta o container Nest sem banco
bun run db:migrate       # aplica migrations pendentes (CI faz isso antes do deploy)
bun run db:show          # lista migrations aplicadas e pendentes
bun run db:generate <caminho>  # gera migration a partir do diff entidades × banco
bun run db:check         # falha se entidades e banco divergem
docker compose up        # api + redis local
```

Antes de abrir PR: `format:check`, `lint`, `typecheck`, `test`, `test:e2e` e `build` limpos. É o que o CI roda (o e2e usa um `postgres:16-alpine` como service container).

## Estrutura

```
src/
  main.ts                    bootstrap Fastify
  app.module.ts              logger + TypeORM + auth + health + um agregador por domínio
  shared/config/env.ts       schema Zod do ambiente (único lugar que lê process.env)
  shared/http/               adapter Fastify, pipe de validação global, filtro de exceção, health (/health/{startup,live,ready})
  shared/observability/      correlação de request (x-request-id), logger pino, Sentry
  shared/contracts/          tipos compartilhados (barrel) e ErrorResponse
  shared/decorators/         @Public, @RequirePermissions, @User
  shared/utils/              funções puras
  auth/                      guards globais (autenticação JWT + autorização por permissão derivada do papel), TokenVerifier
  modules/<dominio>/         domínios de negócio: <dominio>.module.ts (agregador), <caso-de-uso>/, repositories/, contracts/
  infrastructure/database/schema/  entidades TypeORM + ENTITIES
  infrastructure/integration/  portas + adaptadores externos (twilio, supabase, spider, anthropic, voyage, google, eleven-labs, customer-database) e mocks
```

Guia completo para quem trabalha no código: `CLAUDE.md`, com as regras de arquitetura em `.claude/rules/` e o fluxo de nova funcionalidade na skill `new-feature-flow`.

## Deploy

A API roda no Railway, que faz build e deploy fora do CI deste repositório; as variáveis de ambiente (incluindo `ALLOWED_ORIGINS`) ficam no painel do Railway. Push em `main` roda o CI e o job `migrate` (`.github/workflows/ci-cd.yml`), que aplica as migrations pendentes. O serviço lê `PORT` do ambiente.
