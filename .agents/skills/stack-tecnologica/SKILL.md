---
name: stack-tecnologica
description: 'Referência de infraestrutura e stack tecnológica do split-ai: provedores externos (Anthropic/DeepSeek, Voyage AI, Supabase/pgvector, Twilio WhatsApp, GCS, Spider, Tavily, Google TTS/Vision, ElevenLabs), tokens de injeção, variáveis de ambiente (env.ts) e configuração de banco de dados.'
---

# Referência da Stack Tecnológica e Infraestrutura

Inventário de todos os serviços externos integrados ao backend do **Sherlock AI** (`split-ai`), os tokens que expõem cada um e as variáveis de ambiente correspondentes. As regras arquiteturais para criar ou alterar integrações estão em `.agents/rules/07-integracoes-externas.md`.

## Stack principal

<tabela>

| Camada             | Tecnologia                                                 | Finalidade                                                                       |
| ------------------ | ---------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Runtime & Pacotes  | Node.js + TypeScript estrito, `bun`                        | Runtime de execução e gerenciador de pacotes (`bun.lock`)                        |
| Framework HTTP     | NestJS 11 (`@nestjs/platform-fastify`, Fastify 5)          | Servidor HTTP, injeção de dependência e validação                                |
| ORM                | TypeORM 0.3 (`synchronize: false`)                         | Entidades em `schema/`, repositórios e migrations                                |
| Banco de dados     | PostgreSQL no Supabase                                     | Armazenamento relacional + `PostgresStore` + `PostgresSaver` + `pgvector`        |
| Validação HTTP     | `class-validator` + `class-transformer`                    | Validação de DTOs via `ValidationPipe` global                                    |
| Autenticação       | `jsonwebtoken` (HS256)                                     | JWT emitido pelo próprio backend em `POST /auth/login` (PC-001)                  |
| Orquestração de IA | `deepagents`, LangChain, LangGraph, `@langchain/anthropic` | Agentes, VFS (`CompositeBackend`), ferramentas e saída estruturada               |
| Observabilidade    | `nestjs-pino` + Sentry + LangSmith                         | Logs estruturados JSON com `x-request-id`, rastreamento de erros e traces de LLM |
| Configuração       | Zod (`src/shared/config/env.ts`)                           | Validação e congelamento de todas as variáveis de ambiente no boot               |

</tabela>

## Provedores externos (`src/infrastructure/providers/`)

Todos os tokens são definidos em `src/infrastructure/providers/<name>.provider.ts` e exportados pelo `@Global()` `InfrastructureModule` (alternando entre implementação `live` e `mock` conforme `env.INTEGRATION_MODE`). Injete pelo token (`@Inject(TOKEN)`), sem importar o módulo.

<tabela>

| Necessidade               | Token                                     | Interface              | Arquivo do Provider                                    | Consumidores principais                                              |
| ------------------------- | ----------------------------------------- | ---------------------- | ------------------------------------------------------ | -------------------------------------------------------------------- |
| Modelo de chat (LLM)      | `CHAT_MODEL_SERVICE`                      | `IChatModelService`    | `providers/anthropic.provider.ts`                      | `ResolveAgentService`                                                |
| Embeddings (1024d)        | `EMBEDDINGS_SERVICE`                      | `IEmbeddingsService`   | `providers/voyage.provider.ts`                         | `RecordChatMessageService`, `SupabaseProvider`                       |
| Vector store (`pgvector`) | `VECTOR_STORE_SERVICE`, `SUPABASE_CLIENT` | `IVectorStoreService`  | `providers/supabase.provider.ts`                       | Ingestão de fontes, `VectorSearchToolService`, `DeleteSourceService` |
| Reranking cross-encoder   | `RERANKER_SERVICE`                        | `IRerankerService`     | `providers/voyage.provider.ts` (via `ResilientClient`) | `RerankDocumentsService` (`VoyageRerankCompressor`)                  |
| Web crawling              | `SPIDER_SERVICE`                          | `ISpiderService`       | `providers/spider.provider.ts`                         | `LoadAgentSitesService`                                              |
| Busca web em tempo real   | `TAVILY_SEARCH_SERVICE`                   | `ITavilySearchService` | `providers/tavily.provider.ts`                         | `TavilySearchService` (`tavily_search`)                              |
| Mensageria WhatsApp       | `TWILIO_SERVICE`, `TWILIO_CLIENT`         | `ITwilioService`       | `providers/twilio.provider.ts`                         | `WhatsappWebhookService`                                             |
| Síntese de voz (TTS)      | `TEXT_TO_SPEECH_SERVICE`                  | `ITextToSpeechService` | `providers/text-to-speech.provider.ts`                 | `ConvertTextToSpeechService`                                         |
| Armazenamento de objetos  | `GCP_STORAGE_SERVICE`                     | `IGcpStorageService`   | `providers/gcp-storage.provider.ts`                    | `ConvertTextToSpeechService`, processamento de fontes                |
| OCR de imagens            | `GOOGLE_VISION_SERVICE`                   | `IGoogleVisionService` | `providers/google-vision.provider.ts`                  | `ExtractOcrTextService` / `ProcessImageSourceService`                |

</tabela>

## Banco de dados — PostgreSQL no Supabase

- **Entidades TypeORM (`ENTITIES` em `src/infrastructure/database/schema/index.ts`):** `SessionEntity` (`sessions`), `MessageEntity` (`messages`), `AgentEntity` (`agents`), `AgentConnectionEntity` (`agent_connections`), `UserEntity` (`users`), `UserTokenEntity` (`user_tokens`), `NotificationEntity` (`notifications`), `ReportEntity` (`reports`) e `SourceEntity` (`sources`).
- **Soft delete em todas as entidades:** coluna `deleted_at` e índices únicos parciais (`WHERE "deleted_at" IS NULL`).
- **Tabelas do LangGraph / Deep Agents:** `store`, `store_migrations` (`PostgresStore`) e `checkpoints*` (`PostgresSaver`), gerenciadas por `@langchain/langgraph-checkpoint-postgres` (`src/modules/store/`).
- **Tabela vetorial:** `documents`, índice HNSW/IVFFlat e função `match_documents`, gerenciados manualmente no SQL Editor do Supabase.

## Variáveis de ambiente (`src/shared/config/env.ts`)

<tabela>

| Grupo                            | Variáveis                                                                                                                                                                                                     |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Aplicação                        | `NODE_ENV`, `ENV`, `PORT` (padrão `4000`), `FRONTEND_URL`, `ALLOWED_ORIGINS`, `LOG_LEVEL`, `SWAGGER_ENABLED`, `INTEGRATION_MODE` (`mock` \| `live`)                                                           |
| Cliente HTTP (`ResilientClient`) | `HTTP_TIMEOUT_MS`, `HTTP_RETRIES`, `HTTP_BACKOFF_BASE_MS`, `HTTP_CIRCUIT_FAILURE_THRESHOLD`, `HTTP_CIRCUIT_OPEN_MS`, `HTTP_ALLOWED_HOSTS` (padrão `api.voyageai.com`)                                         |
| Banco de dados                   | `DATABASE_URL` (**obrigatória**), `DATABASE_POOL_MIN`, `DATABASE_POOL_MAX`, `DATABASE_STATEMENT_TIMEOUT_MS`, `DATABASE_CONNECTION_TIMEOUT_MS`                                                                 |
| Autenticação                     | `JWT_SECRET` (**obrigatória**, mín. 32 chars), `JWT_EXPIRATION_HOURS`                                                                                                                                         |
| IA / LLM                         | `ANTHROPIC_API_KEY`, `ANTHROPIC_BASE_URL` (padrão aponta para endpoint DeepSeek compatível com Anthropic), `AI_MODEL`, `ORCHESTRATOR_MODEL`, `LANGCHAIN_API_KEY`, `LANGCHAIN_PROJECT`, `LANGCHAIN_TRACING_V2` |
| Recuperação (Voyage / RAG)       | `VOYAGEAI_API_KEY`, `EMBEDDING_MODEL` (`voyage-3-large`), `RERANK_MODEL` (`rerank-2.5`), `VECTOR_SEARCH_CANDIDATE_K` (`50`), `VECTOR_SEARCH_MIN_SCORE` (`0.8`), `VECTOR_SEARCH_MAX_RESULTS` (`10`)            |
| Supabase                         | `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_JWKS_URL`                                                                                                                        |
| Observabilidade                  | `SENTRY_DSN`                                                                                                                                                                                                  |
| WhatsApp (Twilio)                | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`                                                                                                                                           |
| Crawling & Busca Web             | `SPIDER_API_KEY`, `TAVILY_API_KEY`                                                                                                                                                                            |
| Voz & Áudio                      | `TTS_PROVIDER` (`google` \| `elevenlabs`), `GCS_AUDIO_BUCKET`, `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, `ELEVENLABS_MODEL_ID`, `ELEVENLABS_OUTPUT_FORMAT`                                                 |

</tabela>
