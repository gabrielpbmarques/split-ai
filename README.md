# split-ai

Backend NestJS 10 + Fastify de um assistente de IA multi-organização: chat com agentes (LangChain / LangGraph + Anthropic Claude), ingestão de fontes (sites, PDF, DOCX, OCR), busca semântica (Voyage AI + Supabase pgvector), voz, WhatsApp, API keys e cobrança (Stripe).

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
bun run test:e2e         # jest com test/jest-e2e.json
bun run di:verify        # confere se cada módulo importa o que seus providers injetam
bun run di:boot-check    # monta o container Nest sem banco
bun run seed:maia        # seed da organização MAIA e planos base
docker compose up        # api + redis local
```

Antes de abrir PR: `format:check`, `lint`, `typecheck`, `test` e `build` limpos. É o que o CI roda.

## Estrutura

```
src/
  main.ts                    bootstrap Fastify
  app.module.ts              TypeORM + módulos de componentes + health
  shared/config/env.ts       schema Zod do ambiente (único lugar que lê process.env)
  auth/                      guards (JWT, ApiKey, composto, papéis de organização)
  components/<Scope>/<UseCase>/   um caso de uso = um módulo = um controller = um endpoint
  repositories/              wrappers TypeORM, um módulo por repositório
  entities/                  entidades TypeORM
  infrastructure/providers/  SDKs externos (Voyage, Supabase, Stripe, Twilio, SendGrid, GCS, Spider, Google TTS, ElevenLabs)
  types/models/              tipos compartilhados
  utils/                     funções puras
```

Guia completo para quem trabalha no código: `CLAUDE.md`. Plano de refatoração em andamento: `docs/plano-refatoracao-backend-rules.md`.

## Deploy

Push em `main` constrói a imagem Docker, publica no Artifact Registry e faz `gcloud run deploy split-ai` em `southamerica-east1` (`.github/workflows/ci-cd.yml`). O serviço lê `PORT` do Cloud Run.
