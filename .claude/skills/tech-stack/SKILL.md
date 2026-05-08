---
name: tech-stack
description: 'Use when: questions about which external services are used, how they integrate, what tokens/providers are available, environment variables, database setup, payment processing, notifications, file storage, SMS/WhatsApp/voice, email, AI/LLM, vector search, web crawling, OCR, or any infrastructure-related topic.'
---

You are the **Tech Stack Agent** for the Split-AI / Maia NestJS backend. You hold the technical knowledge about every external service, SDK, and tool integrated into the project. When asked about infrastructure capabilities, service boundaries, or how a specific integration works, consult this reference.

All providers below live in `src/infrastructure/providers/` and are wired through `src/infrastructure/infrastructure.module.ts`. Consume them from a use case by importing `InfrastructureModule` as a whole and injecting the relevant token via `@Inject(TOKEN)`.

## Core Stack

| Layer         | Technology                          | Purpose                                        |
| ------------- | ----------------------------------- | ---------------------------------------------- |
| Runtime       | Node.js 22 + TypeScript + Bun       | Application runtime and package manager        |
| Framework     | NestJS 10 (Fastify adapter)         | HTTP framework with DI                         |
| ORM           | TypeORM                             | PostgreSQL access and entity management        |
| Database      | PostgreSQL                          | Primary data store (`databaseUrl` in `config`) |
| Vector store  | Supabase (`pgvector`)               | RAG embeddings via `@langchain/community`      |
| AI            | Google Vertex AI + OpenAI           | LLM and embeddings                             |
| Agent runtime | LangChain + LangGraph               | Pipeline orchestration + Postgres checkpointer |
| Cache/Queue   | Redis (`redisUrl`)                  | Used by LangChain Redis + general caching      |
| Validation    | class-validator + class-transformer | DTO validation                                 |
| Auth          | JWT (`@nestjs/jwt`)                 | Token-based authentication                     |
| Scheduling    | `@nestjs/schedule`                  | Cron jobs and periodic tasks                   |
| Throttling    | `@nestjs/throttler`                 | Rate limiting (60 s / 10 req)                  |
| Observability | Sentry (`@sentry/node`) + LangSmith | Error tracking + LLM tracing                   |
| Logging       | Winston + Fastify request hooks     | Structured request/response logs               |

## Database — PostgreSQL (TypeORM)

- **Connection**: Configured in `AppModule` via `TypeOrmModule.forRoot({ type: 'postgres', url: config.databaseUrl, ... })`.
- **Entities**: Auto-loaded from `src/entities/**/*.entity.{ts,js}`.
- **Synchronize**: `synchronize: true` is enabled — schema changes follow entity edits automatically. Be cautious; this includes production unless overridden.
- **SQL migrations**: Manual scripts in `migrations/` (e.g., `create_payment_credit_tables.sql`, `seed_plans.sql`) for data seeding and structural changes that shouldn't rely on `synchronize`.
- **LangGraph checkpointer**: `@langchain/langgraph-checkpoint-postgres` persists agent state in the same Postgres instance.

## Supabase — Vector Store (RAG)

- **Provider**: `supabase.provider.ts`
- **Tokens**: `SUPABASE_CLIENT`, `SUPABASE_SERVICE`
- **Library**: `@supabase/supabase-js` + `@langchain/community/vectorstores/supabase`
- **Env vars**: `SUPABASE_URL`, `SUPABASE_API_KEY`, `SUPABASE_API_PUBLIC_KEY`
- **Purpose**: Stores document chunk embeddings (`documents` table, `match_documents` RPC). `SupabaseService.createVectorStore(docs, metadata)` writes chunks tagged with `CustomMetadata` (e.g., agent/org/source IDs) so retrieval can filter per-agent.
- **Used by**: `Source/GenerateAgentSource`, `Pdf/ProcessPdf`, `ArtificialIntelligence/LoadVectorStore`, `ArtificialIntelligence/ExecuteSimilaritySearch`.

## Vertex AI — LLM + Embeddings

- **Provider**: `vertex-ai.provider.ts`
- **Tokens**: `VERTEX_AI_CHAT`, `VERTEX_AI_EMBEDDINGS`
- **Library**: `@langchain/google-vertexai`
- **Env vars**: `AI_MODEL` (chat model), `EMBEDDING_MODEL`, `GOOGLE_VERTEX_AI_API_KEY`
- **Purpose**:
  - `VERTEX_AI_CHAT` (`ChatVertexAI`, `temperature: 0.4`) — primary LLM for agent responses.
  - `VERTEX_AI_EMBEDDINGS` (`VertexAIEmbeddings`) — used both at ingestion (chunk embedding) and query (similarity search).
- **Used by**: `ArtificialIntelligence/GenerateAIResponse`, `ArtificialIntelligence/ExecuteSimilaritySearch`, `Supabase` provider (injects embeddings into the vector store).

## OpenAI

- **Library**: `openai` (direct), also via `@langchain/openai`
- **Purpose**: Secondary LLM/embeddings option used inside specific LangChain chains and evaluation flows (`openevals`). No dedicated provider file — invoked directly inside the use cases that need it.

## Google Cloud Storage (GCS) — File Storage

- **Provider**: `gcp-storage.provider.ts`
- **Token**: `GCP_STORAGE_SERVICE`
- **Library**: `@google-cloud/storage`
- **Bucket**: `alert-calls-audios` (hardcoded in the service)
- **Purpose**: Uploads MP3 audio (TTS output) and other media. Returns a public-style URL `https://storage.googleapis.com/<bucket>/<file>`; access depends on bucket IAM (uniform bucket-level access — no per-object ACLs).
- **Operations**: `uploadMp3File(filePath, fileName)`, `deleteFile(fileName)`.
- **Used by**: `ArtificialIntelligence/ConvertTextToSpeech` (persists synthesized audio).

## Google Text-to-Speech — Voice Generation

- **Provider**: `google-voice.provider.ts`
- **Token**: `GOOGLE_VOICE_SERVICE`
- **Library**: `@google-cloud/text-to-speech`
- **Purpose**: Converts text into MP3 audio. Default config: `pt-BR`, female voice, MP3 encoding (overridable via `googleVoice.languageCode`, `googleVoice.ssmlGender`, `googleVoice.audioEncoding` in `ConfigService`).
- **Used by**: `ArtificialIntelligence/ConvertTextToSpeech`.

## Google Vision — OCR

- **Library**: `@google-cloud/vision`
- **Purpose**: Extracts text from images and scanned documents. Used inside the `OCR` scope rather than via a dedicated provider file.
- **Used by**: `OCR/ExtractOcrText` (which is in turn called from `AIChat/ExtractDocumentData` and `Source/GenerateAgentSource` for image inputs).

## Twilio — SMS, WhatsApp & Voice

- **Provider**: `twilio.provider.ts`
- **Tokens**: `TWILIO_CLIENT`, `TWILIO_SERVICE`
- **Library**: `twilio`
- **Env vars**: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, `TWILIO_WHATSAPP_NUMBER`
- **Interface (`ITwilioService`)**:
  - `sendSmsMessage(phone, code)` — verification SMS in Portuguese (`"Seu código de verificação Split AI é: ..."`, 10-min validity). Auto-prefixes `+55` when the number doesn't already start with `55`.
  - `sendWhatsapp(phone, message)` — outbound WhatsApp via the configured WhatsApp number. Same `+55` normalization.
  - `createCall({ to, twiml })` — automated voice call with TwiML payload.
- **Used by**: `Auth/SendSms`, `Whatsapp/Webhook` (replies), and any future call-out flow.

## SendGrid — Transactional Email

- **Provider**: `sendgrid.provider.ts`
- **Tokens**: `SENDGRID_CLIENT`, `EMAIL_SERVICE`
- **Library**: `@sendgrid/mail`
- **Env vars**: `SENDGRID_API_KEY`, `SENDGRID_EMAIL_DEFAULT_FROM`
- **Interface (`EmailService`)**:
  - `send(options)` — supports `text`, `html`, or `templateId` + `dynamicTemplateData`.
  - `sendWithTemplate(to, subject, templateId, dynamicData)` — convenience for SendGrid dynamic templates.
- **Used by**: `Email/email.service.ts` (wraps it), Auth flows (verification), Payment flows (invoices/receipts).

## Stripe — Payments & Subscriptions

- **Provider**: `stripe.provider.ts`
- **Token**: `STRIPE_CLIENT` (raw `Stripe` SDK instance, `apiVersion: '2023-10-16'`)
- **Library**: `stripe`
- **Env vars**: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- **Purpose**: Checkout sessions, subscription billing, and webhook ingestion. The webhook handler in `Payment/StripeWebhook` translates Stripe events into local mutations on `payment`, `credit_balance`, `credit_transaction`, `plan`, and `subscription` entities.
- **Frontend bootstrap**: `Payment/GetStripePublicKey` returns the publishable key to the Angular app, which uses `@stripe/stripe-js` for Checkout redirects.

## Spider Cloud — Web Crawler

- **Provider**: `spider.provider.ts`
- **Token**: `SPIDER_SERVICE`
- **Library**: `@spider-cloud/spider-client` + `@langchain/community/document_loaders/web/spider`
- **Env var**: `SPIDER_API_KEY`
- **Purpose**: Crawls a URL into LangChain `Document[]`. Used to ingest websites as agent knowledge sources — the result is then chunked and embedded into the Supabase vector store.
- **Used by**: `Source/GenerateAgentSource` (when the source is a URL), `ArtificialIntelligence/LoadAgentSites`.

## LangChain / LangGraph — Agent Runtime

- **Libraries**: `langchain`, `@langchain/classic`, `@langchain/core`, `@langchain/langgraph`, `@langchain/langgraph-checkpoint-postgres`, `@langchain/community`, `@langchain/redis`, `@langchain/openai`, `@langchain/google-vertexai`.
- **Purpose**: Orchestrates the agent pipeline — system prompt assembly, tool invocation (vector search, database lookup), and stateful multi-turn conversation via the Postgres checkpointer.
- **Tracing**: LangSmith (`langsmith`), env vars `LANGCHAIN_PROJECT`, `LANGCHAIN_WORKSPACE_ID`.
- **Used by**: All `ArtificialIntelligence/*` use cases.

## Redis

- **Library**: `redis`, `@upstash/redis`, `@langchain/redis`
- **Env var**: `REDIS_URL` (defaults to `redis://localhost:6379`; in `docker-compose.yml` it's `redis://redis:6379`)
- **Purpose**: General-purpose cache and LangChain Redis-backed memory/cache integrations.

## PDF Processing

- **Libraries**: `pdf-parse`, `pdfjs-dist` (`@types/pdfjs-dist`)
- **Purpose**: Local PDF parsing — used by the `Pdf` scope (`LoadPdf` → `ExtractPdfChunks` → `ProcessPdf`). The pipeline parses the file, chunks the text, embeds chunks via Vertex AI, and writes them to Supabase.

## Sentry — Error Tracking

- **Provider**: `src/observability/sentry.provider.ts` (initialized inline in `main.ts`)
- **Library**: `@sentry/node` + `@sentry/tracing`
- **Env var**: `SENTRY_DSN`
- **Activation**: Only when `config.env === 'production'`. Adds Fastify `onRequest`/`onError` hooks to capture context and exceptions.

## Mongoose / MongoDB

- **Library**: `@nestjs/mongoose`, `mongoose`
- **Env var**: `MONGO_URI` (defaults to `mongodb://localhost:27017/split-ai`)
- **Status**: Listed as a dependency and configured in `config.ts`, but the primary persistence is PostgreSQL via TypeORM. Use only for explicitly Mongo-backed collections; default new entities to TypeORM.

## Bun

- **Role**: Runtime + package manager (`bun install`, `bun run start:dev`, etc.). The Dockerfile installs Bun on top of `node:22-slim` and runs the app with `bun run start`.

## Environment Variables Reference

### General

| Variable           | Description                                    |
| ------------------ | ---------------------------------------------- |
| `ENV` / `NODE_ENV` | Environment name (`production` enables Sentry) |
| `PORT`             | HTTP server port (default 4000)                |
| `SENTRY_DSN`       | Sentry DSN                                     |

### Database

| Variable                                                                                        | Description                                    |
| ----------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `DATABASE_URL`                                                                                  | Full Postgres connection URL (used by TypeORM) |
| `DATABASE_HOST` / `DATABASE_PORT` / `DATABASE_USERNAME` / `DATABASE_PASSWORD` / `DATABASE_NAME` | Discrete fields (mirrored in `config.ts`)      |
| `MONGO_URI`                                                                                     | Optional MongoDB URI                           |
| `REDIS_URL`                                                                                     | Redis connection URL                           |

### AI / Vector

| Variable                   | Description                     |
| -------------------------- | ------------------------------- |
| `AI_MODEL`                 | Vertex AI chat model name       |
| `EMBEDDING_MODEL`          | Vertex AI embeddings model name |
| `GOOGLE_VERTEX_AI_API_KEY` | Vertex AI API key               |
| `LANGCHAIN_PROJECT`        | LangSmith project               |
| `LANGCHAIN_WORKSPACE_ID`   | LangSmith workspace             |

### Supabase

| Variable                  | Description                                       |
| ------------------------- | ------------------------------------------------- |
| `SUPABASE_URL`            | Supabase project URL                              |
| `SUPABASE_API_KEY`        | Service-role / server key                         |
| `SUPABASE_API_PUBLIC_KEY` | Anon/public key (used by the vector store client) |

### Email (SendGrid)

| Variable                      | Description          |
| ----------------------------- | -------------------- |
| `SENDGRID_API_KEY`            | SendGrid API key     |
| `SENDGRID_EMAIL_DEFAULT_FROM` | Default sender email |

### SMS / WhatsApp / Voice (Twilio)

| Variable                 | Description                |
| ------------------------ | -------------------------- |
| `TWILIO_ACCOUNT_SID`     | Twilio account SID         |
| `TWILIO_AUTH_TOKEN`      | Twilio auth token          |
| `TWILIO_PHONE_NUMBER`    | Sender phone (SMS / Voice) |
| `TWILIO_WHATSAPP_NUMBER` | Sender WhatsApp number     |

### Web Crawling

| Variable         | Description          |
| ---------------- | -------------------- |
| `SPIDER_API_KEY` | Spider Cloud API key |

### Payments (Stripe)

| Variable                 | Description                                       |
| ------------------------ | ------------------------------------------------- |
| `STRIPE_SECRET_KEY`      | Stripe secret key                                 |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (returned to the frontend) |
| `STRIPE_WEBHOOK_SECRET`  | Stripe webhook signing secret                     |

## Service → Provider Token Map

Quick lookup for which token to inject when using a service:

| Need                     | Token                  | Type / Class               |
| ------------------------ | ---------------------- | -------------------------- |
| Vector store write/query | `SUPABASE_SERVICE`     | `SupabaseService`          |
| Raw Supabase client      | `SUPABASE_CLIENT`      | `SupabaseClient`           |
| LLM chat                 | `VERTEX_AI_CHAT`       | `ChatVertexAI`             |
| Embeddings               | `VERTEX_AI_EMBEDDINGS` | `VertexAIEmbeddings`       |
| Transactional email      | `EMAIL_SERVICE`        | `EmailService` (interface) |
| Raw SendGrid client      | `SENDGRID_CLIENT`      | `typeof SendGrid`          |
| File upload (GCS)        | `GCP_STORAGE_SERVICE`  | `GcpStorageService`        |
| Text-to-speech           | `GOOGLE_VOICE_SERVICE` | `GoogleVoiceService`       |
| SMS / WhatsApp / Voice   | `TWILIO_SERVICE`       | `ITwilioService`           |
| Raw Twilio client        | `TWILIO_CLIENT`        | `Twilio`                   |
| Web crawl                | `SPIDER_SERVICE`       | `SpiderService`            |
| Stripe operations        | `STRIPE_CLIENT`        | `Stripe` (raw SDK)         |
