---
name: tech-stack
description: 'Infrastructure reference: which external services are integrated and how (Voyage, Supabase/pgvector, Stripe, Twilio, SendGrid, GCS, Spider, Google TTS), plus tokens, env vars, and database setup.'
---

You are the **Tech Stack Agent** for the NestJS backend. You hold the technical knowledge about every external service, SDK, and tool integrated into the project. When asked about infrastructure capabilities, service boundaries, or how a specific integration works, consult this reference.

## Core Stack

| Layer      | Technology                          | Purpose                                    |
| ---------- | ----------------------------------- | ------------------------------------------ |
| Runtime    | Node.js + TypeScript                | Application runtime                        |
| Framework  | NestJS (Fastify adapter)            | HTTP framework with DI                     |
| ORM        | TypeORM                             | Database access and entity management      |
| Database   | PostgreSQL (+ PostGIS)              | Primary data store with geospatial queries |
| Validation | class-validator + class-transformer | DTO validation                             |
| Auth       | JWT (`@nestjs/jwt`)                 | Token-based authentication                 |
| Scheduling | `@nestjs/schedule`                  | Cron jobs and periodic tasks               |
| Realtime   | Socket.IO (`@nestjs/websockets`)    | WebSocket communication                    |

## Database — PostgreSQL (TypeORM)

- **Connection**: Configured directly in `AppModule` via `TypeOrmModule.forRoot()` with environment variables (`DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_NAME`).
- **PostGIS**: Used for geospatial queries (`ST_DWithin`, `ST_Distance`, `ST_MakePoint`) — finding nearby drivers, stores, or delivery zones within a radius.
- **Entities**: Auto-loaded from `src/infrastructure/database/schema/` via `entities: [__dirname + '/**/*.entity{.ts,.js}']`.
- **Synchronize**: Enabled (`synchronize: true` for dev, false for prod) — schema auto-syncs with entities.

## Google Text-to-Speech — Voice Generation

- **Provider**: `google-voice.provider.ts`
- **Token**: `GOOGLE_VOICE_SERVICE`
- **Library**: `@google-cloud/text-to-speech`
- **Purpose**: Converts text into spoken audio (MP3). Used to generate voice prompts for automated calls or accessibility features.
- **Config**: Portuguese (pt-BR), female voice, MP3 output encoding.
- **Used by**: `ConvertTextToSpeech` (Notification component)

## Google Cloud Storage (GCS) — File Storage

- **Provider**: `gcp-storage.provider.ts`
- **Token**: `GCP_STORAGE_SERVICE`
- **Library**: `@google-cloud/storage`
- **Purpose**: Stores media files, user uploads, and generated audio files.
- **Bucket**: `app-uploads-bucket` (configurable via env)
- **Operations**: Upload files, delete files. Returns public URLs (`https://storage.googleapis.com/...`).
- **Used by**: `UploadMedia` (Storage component), `UpdateProfilePicture` (User component)

## Twilio — SMS & Voice Calls

- **Provider**: `twilio.provider.ts`
- **Tokens**: `TWILIO_CLIENT`, `TWILIO_SERVICE`
- **Env vars**: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, `TWILIO_WEBHOOK_BASE_URL`
- **Purpose**:
  - **SMS**: Sends verification codes for phone number validation during registration or MFA (10-min expiry).
  - **Voice calls**: Creates automated calls with TwiML for critical notifications.
- **Used by**: `SendSms` (Auth), `AutomatedCall` (Notification)

## SendGrid — Transactional Email

- **Provider**: `sendgrid.provider.ts`
- **Tokens**: `SENDGRID_CLIENT`, `EMAIL_SERVICE`
- **Env vars**: `SENDGRID_API_KEY`, `SENDGRID_EMAIL_DEFAULT_FROM`
- **Purpose**: Sends transactional emails — verification emails, password resets, and invoices, with support for plain text, HTML, and dynamic templates.
- **Used by**: `SendVerificationEmail` (Auth component), `SendInvoice` (Billing component)

## Expo Push Notifications — Mobile Push

- **Provider**: `expo-push-notification.provider.ts`
- **Token**: `EXPO_PUSH_NOTIFICATION_SERVICE`
- **Purpose**: Sends push notifications to the React Native (Expo) mobile app. Resolves push tokens from device fingerprints via the `Installation` entity.
- **Features**:
  - Standard and interactive notifications (with `categoryId` for actionable notifications).
  - Supports interruption levels: `passive`, `active`, `time-sensitive`, `critical`.
  - Persists notifications to the `notifications` table for history.
- **API**: Direct HTTP calls to `https://exp.host/--/api/v2/push/send`.
- **Used by**: `PushNotification` (Notification component — consumed by various feature modules like `OrderUpdates`, `ChatMessages`)

## Socket.IO — Real-time WebSocket

- **Not an infrastructure provider** — implemented as a NestJS WebSocket Gateway in `src/modules/notifications/`.
- **Library**: `@nestjs/websockets` + `socket.io`
- **Env vars**: `WEBSOCKET_CORS_ORIGINS`, `WEBSOCKET_NAMESPACE` (default: `/notifications`)
- **Purpose**: Real-time communication with web clients or dashboards. Pushes live data updates, chat messages, and status changes.
- **Key events**: `register-client`, `notifyNewEvent`, `notifyStatusUpdate`.
- **Connection management**: Tracks active user socket connections by userId via in-memory maps or Redis adapter (if scaled).

## Stripe — Payment & Subscriptions

- **Not an infrastructure provider** — integrated directly in the `Payment`/`Billing` component.
- **Library**: `stripe`
- **Env vars**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- **Purpose**: Manages subscription billing and one-off payments. Handles webhook events for the full payment lifecycle.
- **Handled events**: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`.
- **Entity**: `SubscriptionEntity` tracks subscription/payment status per user.

## Kafka — Event Streaming (Configured, No Provider Module)

- **Provider**: `kafka.provider.ts`
- **Tokens**: `KAFKA_CLIENT`, `KAFKA_SERVICE`
- **Env vars**: `KAFKA_BROKERS`, `KAFKA_SSL`, `KAFKA_SASL`, `KAFKA_SASL_USERNAME`, `KAFKA_SASL_PASSWORD`, `KAFKA_TOPIC_PREFIX`
- **Library**: `kafkajs`
- **Purpose**: Event streaming for async processing (e.g., background reports, audit logging). Supports publish/subscribe patterns.
- **Note**: The Kafka provider exists but has **no `*.provider.module.ts`**, so nothing can import it. Wiring it up means adding that module next to the provider file. It's available for scale-out use cases.

## Google Geocoding — Reverse Geocoding

- **Not an infrastructure provider** — implemented directly in a `GeolocationUtils` or external service wrapper.
- **Library**: `node-geocoder` (Google provider + OpenStreetMap fallback)
- **Env var**: `GOOGLE_GEOCODING_API_KEY`
- **Purpose**: Converts coordinates (lat/lng) to human-readable addresses when registering locations or tracking events.
- **Fallback**: If Google API is unavailable or not configured, falls back to OpenStreetMap.

## Voyage AI — Embeddings & Reranking

Two separate providers, one API key (`VOYAGEAI_API_KEY`), one shared rate-limit quota.

| Provider   | File                                                         | Token                   | Purpose                                                                                                                                                           |
| ---------- | ------------------------------------------------------------ | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Embeddings | `src/infrastructure/voyage-rerank/voyage-embeddings.provider.ts` | `VOYAGE_EMBEDDINGS`     | `voyage-3-large`, 1024 dims (`outputDimension` hard-coded). Key is read by the SDK from the env, never passed by the factory.                                     |
| Reranking  | `src/infrastructure/voyage-rerank/voyage-rerank.provider.ts`     | `VOYAGE_RERANK_SERVICE` | Cross-encoder `rerank-2.5` via plain `fetch` on `POST https://api.voyageai.com/v1/rerank`. Returns `{ index, relevanceScore }[]`, sorted by descending relevance. |

Env vars:

| Variable                    | Default      | Description                                                                                                             |
| --------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `VOYAGEAI_API_KEY`          | —            | Shared by both providers. Read directly from env by `VoyageEmbeddings`; read via `config.voyageApiKey` by the reranker. |
| `EMBEDDING_MODEL`           | —            | `voyage-3-large`                                                                                                        |
| `RERANK_MODEL`              | `rerank-2.5` | Cross-encoder model                                                                                                     |
| `VECTOR_SEARCH_CANDIDATE_K` | `50`         | Dense candidates fetched before reranking (recall ceiling)                                                              |
| `VECTOR_SEARCH_MIN_SCORE`   | `0.8`        | Minimum `relevance_score` to survive                                                                                    |
| `VECTOR_SEARCH_MAX_RESULTS` | `10`         | Cap on documents returned to the LLM                                                                                    |

**Rate limits are tier-based and shared.** Without a _default_ payment method on the org, every model group is capped at **3 RPM / 10K TPM**, and the 429 body says `"You have not yet added your payment method"`. Adding one (Tier 1) lifts `voyage-3-large` to 3M TPM / 2000 RPM and `rerank-2.5` to 2M TPM / 2000 RPM; ≥$100 paid doubles it (Tier 2), ≥$1000 triples it (Tier 3). Two gotchas seen in practice: a card can sit in the dashboard **without being the default** and not count, and after fixing it the dashboard flips several minutes before the API enforcement layer does — verify with a burst of concurrent calls, not with the dashboard. The 200M free rerank tokens still apply on every tier.

Since retrieval reranks, **each search costs two Voyage calls** (one embed + one rerank) against the same quota.

## Environment Variables Reference

### Database

| Variable            | Description                     |
| ------------------- | ------------------------------- |
| `DATABASE_HOST`     | PostgreSQL host                 |
| `DATABASE_PORT`     | PostgreSQL port (default: 5432) |
| `DATABASE_USERNAME` | PostgreSQL username             |
| `DATABASE_PASSWORD` | PostgreSQL password             |
| `DATABASE_NAME`     | PostgreSQL database name        |

### Auth & Security

| Variable         | Description                      |
| ---------------- | -------------------------------- |
| `JWT_SECRET`     | JWT signing secret               |
| `JWT_EXPIRATION` | Token TTL in hours (default: 24) |

### Vector Store / Extensibility (Supabase/Pinecone/etc.)

| Variable           | Description          |
| ------------------ | -------------------- |
| `VECTOR_STORE_URL` | Provider project URL |
| `VECTOR_STORE_KEY` | Provider API key     |

### Email (SendGrid)

| Variable                      | Description                  |
| ----------------------------- | ---------------------------- |
| `SENDGRID_API_KEY`            | SendGrid API key             |
| `SENDGRID_EMAIL_DEFAULT_FROM` | Default sender email address |

### SMS & Voice (Twilio)

| Variable                  | Description                  |
| ------------------------- | ---------------------------- |
| `TWILIO_ACCOUNT_SID`      | Twilio account SID           |
| `TWILIO_AUTH_TOKEN`       | Twilio auth token            |
| `TWILIO_PHONE_NUMBER`     | Twilio phone number (sender) |
| `TWILIO_WEBHOOK_BASE_URL` | Base URL for Twilio webhooks |

### Payments (Stripe)

| Variable                | Description                   |
| ----------------------- | ----------------------------- |
| `STRIPE_SECRET_KEY`     | Stripe API secret key         |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |

### Geolocation

| Variable                   | Description              |
| -------------------------- | ------------------------ |
| `GOOGLE_GEOCODING_API_KEY` | Google Geocoding API key |

### WebSocket

| Variable                 | Description                                     |
| ------------------------ | ----------------------------------------------- |
| `WEBSOCKET_CORS_ORIGINS` | Comma-separated allowed origins                 |
| `WEBSOCKET_NAMESPACE`    | Socket.IO namespace (default: `/notifications`) |

### Kafka (Optional)

| Variable              | Description                      |
| --------------------- | -------------------------------- |
| `KAFKA_BROKERS`       | Comma-separated broker addresses |
| `KAFKA_SSL`           | Enable SSL (`true`/`false`)      |
| `KAFKA_SASL`          | Enable SASL auth                 |
| `KAFKA_SASL_USERNAME` | SASL username                    |
| `KAFKA_SASL_PASSWORD` | SASL password                    |
| `KAFKA_TOPIC_PREFIX`  | Topic prefix (default: `prod-`)  |

### General

| Variable     | Description                          |
| ------------ | ------------------------------------ |
| `ENV`        | Environment name                     |
| `PORT`       | HTTP server port (default: 3000)     |
| `SENTRY_DSN` | Sentry error tracking DSN (optional) |

## Service → Provider Token Map

Quick lookup for which token to inject when using a service:

| Need                    | Token                            | Interface/Class               |
| ----------------------- | -------------------------------- | ----------------------------- |
| Vector store operations | `VECTOR_STORE_SERVICE`           | `IVectorStoreService`         |
| Voyage embeddings       | `VOYAGE_EMBEDDINGS`              | `VoyageEmbeddings`            |
| Voyage reranking        | `VOYAGE_RERANK_SERVICE`          | `IVoyageRerankService`        |
| Text-to-speech          | `GOOGLE_VOICE_SERVICE`           | `GoogleVoiceService`          |
| File upload (GCS)       | `GCP_STORAGE_SERVICE`            | `GcpStorageService`           |
| SMS & voice calls       | `TWILIO_SERVICE`                 | `ITwilioService`              |
| Twilio raw client       | `TWILIO_CLIENT`                  | `Twilio`                      |
| Transactional email     | `EMAIL_SERVICE`                  | `EmailService`                |
| SendGrid raw client     | `SENDGRID_CLIENT`                | `SendGrid`                    |
| Mobile push (Expo)      | `EXPO_PUSH_NOTIFICATION_SERVICE` | `ExpoPushNotificationService` |
