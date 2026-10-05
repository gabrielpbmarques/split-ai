---
name: tech-stack
description: 'Infrastructure reference: which external services are integrated and how (Anthropic, Voyage, Supabase/pgvector, Twilio WhatsApp, GCS, Spider, Google TTS/Vision, ElevenLabs, external agent databases), which port exposes each, the env vars from src/shared/config/env.ts, and database setup.'
---

Reference for every external service this backend talks to, the port that exposes it and the environment it needs. The rules for building an integration (contracts, mappers, mock mode, `ResilientClient`) are in `.claude/rules/integrations.md`; this file is the inventory. When it disagrees with `src/shared/config/env.ts` or `src/infrastructure/integration/integration.module.ts`, the code wins — fix this file.

## Core stack

| Layer      | Technology                                    | Purpose                                            |
| ---------- | --------------------------------------------- | -------------------------------------------------- |
| Runtime    | Node.js + TypeScript, bun                     | Runtime and package manager                        |
| Framework  | NestJS 11 (Fastify 5 adapter)                 | HTTP framework with DI                             |
| ORM        | TypeORM 0.3                                   | Entities, repositories, migrations                 |
| Database   | PostgreSQL on Supabase                        | Primary store + LangGraph checkpoints              |
| Validation | class-validator + class-transformer           | DTO validation (global pipe)                       |
| Auth       | `jsonwebtoken` HS256                          | Self-issued JWT at `POST /auth/login`, Bearer only |
| AI         | LangChain / LangGraph, `@langchain/anthropic` | Agents, tools, structured output                   |
| Logging    | `nestjs-pino`                                 | Structured logs with `x-request-id`                |
| Env        | Zod (`src/shared/config/env.ts`)              | Validated, frozen configuration                    |

## Ports and adapters

All tokens live in `src/infrastructure/integration/<name>.port.ts` and are published by the `@Global()` `IntegrationModule` (live or mock per `INTEGRATION_MODE`) — inject by token, no module import.

| Need                      | Token               | Interface                 | Live adapter                                                                  | Used by                                               |
| ------------------------- | ------------------- | ------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------- |
| Chat model                | `CHAT_MODEL`        | `ChatModelFactory`        | `anthropic/anthropic-chat-model.factory.ts` (`ChatAnthropic`)                 | `ResolveAgent`                                        |
| Embeddings                | `EMBEDDINGS`        | `EmbeddingsGateway`       | `voyage/voyage-embeddings.factory.ts`                                         | vector store, `RecordChatMessage`                     |
| Vector store              | `VECTOR_STORE`      | `VectorStoreGateway`      | `supabase/supabase-vector-store.gateway.ts`                                   | ingestion, `vector_similarity_search`, `DeleteSource` |
| Reranking                 | `RERANKER`          | `RerankerGateway`         | `voyage/voyage-reranker.gateway.ts` (via `ResilientClient`)                   | `RerankDocuments`                                     |
| Site crawling             | `SITE_CRAWLER`      | `SiteCrawler`             | `spider/spider-site-crawler.gateway.ts`                                       | `LoadAgentSites`                                      |
| WhatsApp                  | `MESSAGING`         | `MessagingGateway`        | `twilio/twilio-messaging.gateway.ts`                                          | `whatsapp/webhook`                                    |
| Text-to-speech            | `TEXT_TO_SPEECH`    | `TextToSpeech`            | `google/google-text-to-speech.gateway.ts` or `eleven-labs/…` (`TTS_PROVIDER`) | `ConvertTextToSpeech`                                 |
| File storage              | `FILE_STORAGE`      | `FileStorage`             | `google/gcs-file-storage.gateway.ts`                                          | `ConvertTextToSpeech`                                 |
| OCR                       | `OCR`               | `OcrReader`               | `google/google-vision-ocr.gateway.ts`                                         | `ExtractOcrText` (sources)                            |
| Agent's external database | `CUSTOMER_DATABASE` | `CustomerDatabaseGateway` | `customer-database/customer-database.gateway.ts`                              | `execute_sql` (`LoadDatabaseTool`)                    |

## Anthropic — chat model

- `AnthropicChatModelFactory.create({ model, temperature })` builds the only `ChatAnthropic` in the repo; `agents.model` falls back to `AI_MODEL`.
- `ANTHROPIC_BASE_URL` defaults to the DeepSeek Anthropic-compatible endpoint the code used to hard-code; set it explicitly to reach Anthropic.
- Without a usable key/model the port reports `NOT_CONFIGURED` and `create()` answers 503.

## Voyage AI — embeddings and reranking

Two ports, one key (`VOYAGEAI_API_KEY`), one shared rate-limit quota.

| Port         | File                                  | Purpose                                                                                                                            |
| ------------ | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `EMBEDDINGS` | `voyage/voyage-embeddings.factory.ts` | LangChain `Embeddings`: `voyage-3-large`, 1024 dims. Without the key it returns an implementation that answers 503 when called.    |
| `RERANKER`   | `voyage/voyage-reranker.gateway.ts`   | Cross-encoder `rerank-2.5` over `ResilientClient` (`POST /v1/rerank`, Zod contract in `voyage.contracts.ts`), sorted by relevance. |

**Rate limits are tier-based and shared.** Without a _default_ payment method every model group is capped at 3 RPM / 10K TPM and the 429 body says `"You have not yet added your payment method"` (PC-007). A card that is not the default does not count, and enforcement lags the dashboard by minutes — verify with a burst of calls. Each search costs two Voyage calls (embed + rerank).

## Supabase — pgvector

- `SupabaseVectorStoreGateway` needs `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`; otherwise `NOT_CONFIGURED`.
- The `documents` table, `match_documents` and the vector index live only in Supabase and are changed by hand in its SQL editor.

## Twilio — WhatsApp

- `MESSAGING` exposes `sendWhatsapp(phone, text)` and `parseInboundWhatsapp(form)` (contract + mapper in `twilio/`). SMS sending was removed with SMS login.
- `POST /whatsapp/webhook` parses the inbound form and auto-creates a user for an unknown sender.

## Google — TTS, GCS, Vision; ElevenLabs

- Google clients use Application Default Credentials (`GOOGLE_APPLICATION_CREDENTIALS` outside GCP) and are built lazily, so they report `READY`.
- TTS defaults to Google (pt-BR, MP3); `TTS_PROVIDER=elevenlabs` switches to ElevenLabs (`ELEVENLABS_*`). Audio is uploaded to `GCS_AUDIO_BUCKET`.

## External agent databases — `CUSTOMER_DATABASE`

- Per-request TypeORM `DataSource` to the URL stored on the agent (`agents.database_url`, `postgres://` / `postgresql://` / `mysql://` / `mysql2://`), destroyed after use.
- Host allowlist `CUSTOMER_DATABASE_ALLOWED_HOSTS` (empty = any public host); loopback/private networks only with `CUSTOMER_DATABASE_ALLOW_INTERNAL_NETWORK=true`; statement and connection timeouts.

## Database — PostgreSQL (TypeORM)

- `TypeOrmModule.forRootAsync` in `AppModule` with `DATABASE_URL` and pool options (`DATABASE_POOL_MIN/MAX`, `DATABASE_STATEMENT_TIMEOUT_MS`, `DATABASE_CONNECTION_TIMEOUT_MS`); timestamps read/written as UTC (`utc-timestamps.ts`).
- Explicit `ENTITIES` array (`src/infrastructure/database/schema/index.ts`): agents, agents_instructions, agent_connections, sessions, messages, sources, reports, users, user_tokens, notifications.
- `synchronize: false`; `MIGRATIONS` run by the CI `migrate` job, never at boot; `/health/startup` answers 503 while one is pending.
- Soft delete on every table; partial unique indexes (`WHERE "deleted_at" IS NULL`).
- The LangGraph `PostgresSaver` keeps `checkpoint*` tables in the same database.

## Environment variables (`src/shared/config/env.ts`)

| Group           | Variables                                                                                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| App             | `NODE_ENV`, `ENV`, `PORT` (4000), `FRONTEND_URL`, `ALLOWED_ORIGINS`, `LOG_LEVEL`, `SWAGGER_ENABLED`, `INTEGRATION_MODE`                                            |
| HTTP client     | `HTTP_TIMEOUT_MS`, `HTTP_RETRIES`, `HTTP_BACKOFF_BASE_MS`, `HTTP_CIRCUIT_FAILURE_THRESHOLD`, `HTTP_CIRCUIT_OPEN_MS`, `HTTP_ALLOWED_HOSTS`                          |
| Database        | `DATABASE_URL` (required), `DATABASE_POOL_MIN`, `DATABASE_POOL_MAX`, `DATABASE_STATEMENT_TIMEOUT_MS`, `DATABASE_CONNECTION_TIMEOUT_MS`                             |
| Auth            | `JWT_SECRET` (required), `JWT_EXPIRATION_HOURS`                                                                                                                    |
| AI              | `ANTHROPIC_API_KEY`, `ANTHROPIC_BASE_URL`, `AI_MODEL`, `ORCHESTRATOR_MODEL`, `LANGCHAIN_PROJECT`                                                                   |
| Retrieval       | `VOYAGEAI_API_KEY`, `EMBEDDING_MODEL`, `RERANK_MODEL`, `VECTOR_SEARCH_CANDIDATE_K` (50), `VECTOR_SEARCH_MIN_SCORE` (0.8), `VECTOR_SEARCH_MAX_RESULTS` (10)         |
| Supabase        | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`                                                                                                        |
| Observability   | `SENTRY_DSN`                                                                                                                                                       |
| WhatsApp        | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`                                                                                                |
| Crawling        | `SPIDER_API_KEY`                                                                                                                                                   |
| Voice           | `TTS_PROVIDER`, `GCS_AUDIO_BUCKET`, `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, `ELEVENLABS_MODEL_ID`, `ELEVENLABS_OUTPUT_FORMAT`                                 |
| Agent databases | `CUSTOMER_DATABASE_ALLOWED_HOSTS`, `CUSTOMER_DATABASE_ALLOW_INTERNAL_NETWORK`, `CUSTOMER_DATABASE_STATEMENT_TIMEOUT_MS`, `CUSTOMER_DATABASE_CONNECTION_TIMEOUT_MS` |

LangSmith tracing reads its own `LANGSMITH_*` variables directly through the LangChain SDK (not through `env.ts`). A new variable goes into the Zod schema **and** `.env.example`.
