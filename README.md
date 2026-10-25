# Sherlock AI (`split-ai`)

Motor de IA pessoal em NestJS 11 + Fastify 5: chat com agentes (LangChain / LangGraph / Deep Agents + Anthropic Claude / DeepSeek), agentes conectados como ferramentas de outros agentes, grafo de conhecimento, ingestão assíncrona de fontes (sites via Spider, PDF, DOCX, texto, OCR via Google Vision), busca semântica por limiar (Voyage AI `voyage-3-large` + `rerank-2.5` + Supabase `pgvector`), busca web em tempo real (Tavily), síntese de voz (Google TTS / ElevenLabs) e WhatsApp (Twilio). Uma única instalação, poucos usuários, sem organizações nem cobrança.

## Requisitos

- [bun](https://bun.sh) 1.3+
- PostgreSQL (o projeto usa Supabase; o vector store `documents` + `match_documents` vive lá)
- Credenciais dos provedores utilizados (ver `.env.example`)

## Primeiros passos

```bash
bun install
cp .env.example .env     # preencher DATABASE_URL e JWT_SECRET no mínimo
bun run start:dev        # http://localhost:4000
```

O schema de ambiente fica em `src/shared/config/env.ts`. Variável obrigatória ausente ou valor inválido aborta o boot listando todos os problemas. Variável nova: adicionar ao schema e ao `.env.example`.

## Comandos

```bash
bun run start:dev              # modo watch (porta padrão 4000)
bun run start:prod             # roda dist/main
bun run build                  # nest build → dist/
bun run format:check           # prettier --check
bun run lint                   # eslint + lint:comments (sem --fix)
bun run lint:fix               # eslint --fix
bun run typecheck              # tsc --noEmit
bun run test                   # jest (specs unitárias)
bun run test:e2e               # e2e contra um Postgres (TEST_DATABASE_URL ou `docker compose up postgres`)
bun run di:verify              # confere se cada módulo importa o que seus providers injetam
bun run di:boot-check          # monta o container Nest real sem banco
bun run db:migrate             # aplica migrations pendentes (a CI executa após o merge na main)
bun run db:show                # lista migrations aplicadas e pendentes
bun run db:generate <caminho>  # gera migration a partir do diff entidades × banco espelho
bun run db:check               # falha se entidades e banco divergem
bun run seed:memories [id]     # sincroniza memories/, skills/ e scratchpad/ locais no PostgresStore
bun run repair:thread <id>     # limpa checkpoint corrompido de uma thread do LangGraph
docker compose up              # api + redis + postgres locais
```

Antes de abrir PR: `format:check`, `lint`, `typecheck`, `test`, `test:e2e`, `build`, `di:verify` e `di:boot-check` limpos.

## Estrutura

```
src/
  main.ts                    Bootstrap Fastify
  app.module.ts              Logger + TypeORM + InfrastructureModule + AuthModule + HealthModule + agregadores de domínio
  shared/config/env.ts       Schema Zod do ambiente (único lugar que lê process.env)
  shared/http/               Adaptador Fastify, ValidationPipe global, GlobalExceptionFilter, health (/health/{startup,live,ready})
  shared/observability/      Correlação de request (x-request-id), logger pino, Sentry
  shared/contracts/          Tipos compartilhados e ErrorResponse
  shared/decorators/         @Public, @RequirePermissions, @User (AuthUser)
  shared/utils/              Funções puras utilitárias
  auth/                      Guards globais (autenticação JWT + autorização por permissão derivada do papel), TokenVerifier
  modules/<domain>/          Domínios de negócio: <domain>.module.ts (agregador), <use-case>/, repositories/, contracts/
  infrastructure/database/   Entidades TypeORM em schema/ (ENTITIES), migrations/ (MIGRATIONS), TransactionExecutor, utc-timestamps
  infrastructure/providers/  Provedores externos (anthropic, voyage, supabase, twilio, spider, tavily, google-vision, gcp-storage, text-to-speech) e mocks
  infrastructure/infrastructure.module.ts  Módulo @Global() que agrega e exporta os provedores
```

Guia completo para quem trabalha no código: `AGENTS.md`, com as regras numeradas em `.agents/rules/` (`00-projeto.md` a `12-problemas-conhecidos.md`) e o fluxo de nova funcionalidade na skill `nova-funcionalidade` (`.agents/skills/nova-funcionalidade/SKILL.md`). A fonte de referência para os padrões de projeto é `/Users/gabrielbutkus/Documents/Projects/ai-agents-engineering`.

## Deploy

A API roda no Railway (https://split-ai-production-4200.up.railway.app), que faz build e deploy automático a partir da `main`; as variáveis de ambiente (incluindo `ALLOWED_ORIGINS`) ficam no painel do Railway. Push na `main` executa a CI e o job `migrate` (`.github/workflows/ci-cd.yml`), que aplica as migrations pendentes. O serviço lê `PORT` do ambiente.
