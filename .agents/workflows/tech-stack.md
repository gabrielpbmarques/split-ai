---
name: tech-stack
description: 'Infrastructure reference: which external services are integrated and how (Anthropic, Voyage, Supabase/pgvector, Twilio WhatsApp, GCS, Spider, Google TTS/Vision, ElevenLabs), which port exposes each, the env vars from src/shared/config/env.ts, and database setup.'
---

Reference for every external service this backend talks to, the port that exposes it and the environment it needs. The rules for building an integration (contracts, mappers, mock mode, `ResilientClient`) are in `.claude/rules/integrations.md`; this file is the inventory.

## Core stack

| Layer      | Technology                                      | Purpose                                            |
| ---------- | ----------------------------------------------- | -------------------------------------------------- |
| Runtime    | Node.js + TypeScript, bun                       | Runtime and package manager                        |
| Framework  | NestJS 11 (Fastify 5 adapter)                   | HTTP framework with DI                             |
| ORM        | TypeORM 0.3                                     | Entities, repositories, migrations                 |
| Database   | PostgreSQL on Supabase                          | Primary store + Deep Agents store                  |
| Validation | class-validator + class-transformer             | DTO validation (global pipe)                       |
| Auth       | `jsonwebtoken` HS256                            | Self-issued JWT at `POST /auth/login`, Bearer only |
| AI         | `deepagents`, LangChain, `@langchain/anthropic` | Agents, tools, memory store, structured output     |
| Logging    | `nestjs-pino`                                   | Structured logs with `x-request-id`                |
| Env        | Zod (`src/shared/config/env.ts`)                | Validated, frozen configuration                    |

## Ports and adapters

All tokens live in `src/infrastructure/integration/<name>.port.ts` and are published by the `@Global()` `IntegrationModule` (live or mock per `INTEGRATION_MODE`) — inject by token, no module import.

| Need           | Token            | Interface            | Live adapter                                                                  | Used by                                    |
| -------------- | ---------------- | -------------------- | ----------------------------------------------------------------------------- | ------------------------------------------ |
| Chat model     | `CHAT_MODEL`     | `ChatModelFactory`   | `anthropic/anthropic-chat-model.factory.ts` (`ChatAnthropic`)                 | `ResolveAgent`                             |
| Embeddings     | `EMBEDDINGS`     | `EmbeddingsGateway`  | `voyage/voyage-embeddings.factory.ts`                                         | vector store, `RecordChatMessage`          |
| Vector store   | `VECTOR_STORE`   | `VectorStoreGateway` | `supabase/supabase-vector-store.gateway.ts`                                   | ingestion, `vector_search`, `DeleteSource` |
| Reranking      | `RERANKER`       | `RerankerGateway`    | `voyage/voyage-reranker.gateway.ts` (via `ResilientClient`)                   | `RerankDocuments`                          |
| Site crawling  | `SITE_CRAWLER`   | `SiteCrawler`        | `spider/spider-site-crawler.gateway.ts`                                       | Source ingestion                           |
| WhatsApp       | `MESSAGING`      | `MessagingGateway`   | `twilio/twilio-messaging.gateway.ts`                                          | `whatsapp/webhook`                         |
| Text-to-speech | `TEXT_TO_SPEECH` | `TextToSpeech`       | `google/google-text-to-speech.gateway.ts` or `eleven-labs/…` (`TTS_PROVIDER`) | `ConvertTextToSpeech`                      |
| File storage   | `FILE_STORAGE`   | `FileStorage`        | `google/gcs-file-storage.gateway.ts`                                          | `ConvertTextToSpeech`                      |
| OCR            | `OCR`            | `OcrReader`          | `google/google-vision-ocr.gateway.ts`                                         | `ExtractOcrText` (sources)                 |

## Anthropic — chat model

- `AnthropicChatModelFactory.create({ model, temperature })` builds the only `ChatAnthropic` in the repo; `agents.model` falls back to `AI_MODEL`.
- `ANTHROPIC_BASE_URL` defaults to DeepSeek Anthropic-compatible endpoint; set it explicitly to reach Anthropic.

## Voyage AI — embeddings and reranking

- `EMBEDDINGS`: Voyage `voyage-3-large`, 1024 dims.
- `RERANKER`: Cross-encoder `rerank-2.5` over `ResilientClient`.

## Supabase — pgvector

- `SupabaseVectorStoreGateway` needs `SUPABASE_URL` + `SUPABASE_SECRET_KEY`.
- `documents` table, `match_documents` and the vector index live only in Supabase.

## Database — PostgreSQL (TypeORM)

- Explicit `ENTITIES` array (`src/infrastructure/database/schema/index.ts`): agents, agent_connections, sessions, messages, sources, users, user_tokens, notifications.
- Soft delete on every table (`deleted_at`).
- `PostgresStore` stores Deep Agents memory and skills in the `store` table.

## Environment variables (`src/shared/config/env.ts`)

| Group         | Variables                                                                                                                                                  |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App           | `NODE_ENV`, `ENV`, `PORT` (4000), `FRONTEND_URL`, `ALLOWED_ORIGINS`, `LOG_LEVEL`, `SWAGGER_ENABLED`, `INTEGRATION_MODE`                                    |
| HTTP client   | `HTTP_TIMEOUT_MS`, `HTTP_RETRIES`, `HTTP_BACKOFF_BASE_MS`, `HTTP_CIRCUIT_FAILURE_THRESHOLD`, `HTTP_CIRCUIT_OPEN_MS`, `HTTP_ALLOWED_HOSTS`                  |
| Database      | `DATABASE_URL` (required), `DATABASE_POOL_MIN`, `DATABASE_POOL_MAX`, `DATABASE_STATEMENT_TIMEOUT_MS`, `DATABASE_CONNECTION_TIMEOUT_MS`                     |
| Auth          | `JWT_SECRET` (required), `JWT_EXPIRATION_HOURS`                                                                                                            |
| AI            | `ANTHROPIC_API_KEY`, `ANTHROPIC_BASE_URL`, `AI_MODEL`, `ORCHESTRATOR_MODEL`, `LANGCHAIN_PROJECT`                                                           |
| Retrieval     | `VOYAGEAI_API_KEY`, `EMBEDDING_MODEL`, `RERANK_MODEL`, `VECTOR_SEARCH_CANDIDATE_K` (50), `VECTOR_SEARCH_MIN_SCORE` (0.8), `VECTOR_SEARCH_MAX_RESULTS` (10) |
| Supabase      | `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_JWKS_URL`                                                                     |
| Observability | `SENTRY_DSN`                                                                                                                                               |
| WhatsApp      | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`                                                                                        |
| Crawling      | `SPIDER_API_KEY`                                                                                                                                           |
| Voice         | `TTS_PROVIDER`, `GCS_AUDIO_BUCKET`, `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, `ELEVENLABS_MODEL_ID`, `ELEVENLABS_OUTPUT_FORMAT`                         |
