---
name: project-scope
description: 'Use when: you need to know which scope a feature belongs to, what use cases already exist, where to add a new endpoint, how scopes interact (e.g., AIChat vs ArtificialIntelligence), or what domain responsibility maps to which folder under `src/components/`. Use when: questions about agents, sessions, sources, credits, payments, OCR/PDF ingestion, embeds, WhatsApp/SMS, reports, or analytics.'
---

You are the **Project Scope Agent** for the Split-AI / Maia backend. The project is an AI-powered conversational platform where organizations create attendant agents that answer questions over their own document corpora (PDFs, websites, OCR-extracted images), accept paid usage via Stripe credits, and integrate with WhatsApp/SMS/email channels.

This skill is the single source of truth for what each scope under `src/components/` does and which use cases live inside it. Use it before scaffolding new code so features land in the correct scope rather than spawning duplicates.

## Domain Map (one-liner per scope)

| Scope                    | Responsibility                                                                                |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| `Auth`                   | Authentication, lite registration, SMS verification, JWT issuance.                            |
| `Register`               | Full self-service sign up flow (creates org + owner user).                                    |
| `User`                   | CRUD over user accounts within an organization.                                               |
| `Organization`           | Organization lifecycle and the public embed widget (token + iframe settings).                 |
| `Session`                | Conversation sessions between an end user and an attendant agent (chat history root).         |
| `AIChat`                 | The end-user-facing chat surface — message persistence + answering pipeline + doc extraction. |
| `ArtificialIntelligence` | Agent definitions, system-prompt assembly, LLM calls, tool loading, vector search.            |
| `Source`                 | Knowledge sources attached to an agent (URLs, files) — ingestion entry point.                 |
| `Pdf`                    | PDF loading, chunking, and ingestion pipeline.                                                |
| `OCR`                    | Image/document text extraction via Google Vision.                                             |
| `Payment`                | Stripe checkout, plans, payment history, webhook ingestion.                                   |
| `Credits`                | Credit balance management and consumption (gates AI usage).                                   |
| `TokenUsage`             | LLM token-usage accounting (per-org observability + billing input).                           |
| `Report`                 | Aggregated conversation reports for organization owners.                                      |
| `Dashboard`              | Owner dashboard — charts and headline statistics.                                             |
| `Analytics`              | Lower-level dashboard data aggregation queries.                                               |
| `Whatsapp`               | Inbound WhatsApp webhook (Twilio) routed into the chat pipeline.                              |
| `Email`                  | Shared email service used across scopes (Auth, Payment, etc.).                                |

## Scope → Use Cases

### `Auth/`

- `CheckUserRegistered` — pre-flight lookup before login/signup branching.
- `GenerateToken` — auxiliary, signs the JWT (no endpoint).
- `Login` — credential login → JWT.
- `RegisterLite` — minimal signup path (e.g., embed/guest origin).
- `SendSms` — issues SMS verification code via Twilio.

### `Register/`

- `SignUp` — full registration flow (creates user + organization + initial plan/credit state).

### `User/`

- `CreateUser`, `GetUser`, `ListUsers`, `UpdateUser` — CRUD scoped by active organization.

### `Organization/`

- `CreateOrganization`, `GetOrganization`, `ListOrganizations`, `UpdateEmbedSettings`.
- `ActivateOrganization`, `DeactivateOrganization` — admin lifecycle toggles.
- `GetEmbedSettings`, `RegenerateEmbedToken` — public widget configuration.
- `PublicEmbed` — public endpoint serving the embed widget metadata.

### `Session/`

- `CreateSessionIfNotExists` — idempotent session bootstrap (called by AIChat / Whatsapp before persisting messages).
- `ListSessions`, `GetSessionMessages`.

### `AIChat/`

- `Attendant` — orchestrates an end-user message → session → agent → answer.
- `Question` — single-turn Q&A entry point.
- `RecordChatMessage` — auxiliary persistence.
- `ExtractDocumentData` — pulls structured fields from a document submitted in chat.

### `ArtificialIntelligence/`

- Agent CRUD: `CreateAgent`, `CreateAttendantAgent`, `ListAgents`, `ResolveAgent`, `UpdateAgent`.
- Prompt construction: `BuildSystemPrompt`, `NormalizePromptInstructions`.
- Inference: `GenerateAIResponse` (LangGraph pipeline), `ConvertTextToSpeech`.
- RAG plumbing: `LoadVectorStore`, `LoadVectorSearchTool`, `ExecuteSimilaritySearch`, `LoadAgentSites`, `LoadDatabaseTool`, `LoadCheckpointer`.

### `Source/`

- `GenerateAgentSource` — ingest a new knowledge source for an agent.
- `GetSource`, `ListSources`, `DeleteSource`.

### `Pdf/`

- `LoadPdf` → `ExtractPdfChunks` → `ProcessPdf` — staged ingestion pipeline. New PDF features extend an existing stage rather than adding a sibling.

### `OCR/`

- `ExtractOcrText` — Google Vision image → text.

### `Payment/`

- `CreateCheckout` — opens a Stripe Checkout session.
- `GetPlans`, `GetStripePublicKey` — frontend bootstrap.
- `GetPaymentHistory`, `GetCredits`, `GetCreditTransactions` — owner-facing reads.
- `StripeWebhook` — receives Stripe events and triggers credit grants / subscription updates.

### `Credits/`

- `ManageCredits` — admin/grant operations.
- `ConsumeCredits` — called by `ArtificialIntelligence` use cases before/after LLM calls.

### `TokenUsage/`

- `RecordTokenUsage` — auxiliary, persisted by AI use cases.
- `GetTokenUsage` — dashboard/reporting read.

### `Report/`

- `ListReports`, `GetReport`, `GetReportConversation`.

### `Dashboard/`

- `Statistics` — headline KPIs.
- `Charts` — chart-ready time series.

### `Analytics/`

- `GetDashboardData` — composed read used by the dashboard scope. Heavy aggregation queries live here.

### `Whatsapp/`

- `Webhook` — Twilio inbound webhook → `Session` + `AIChat` pipeline.

### `Email/`

- `email.service.ts` — direct service (not a use-case sub-folder). Other scopes import `EmailModule` and call the service. Wraps `EMAIL_SERVICE` (SendGrid).

## Cross-Scope Wiring (common imports)

Use this when adding a new use case so you import the right neighbor module instead of duplicating logic:

- Anything that **answers a user message** → import `ArtificialIntelligence` use cases (`GenerateAIResponse`, `ResolveAgent`) + `Session/CreateSessionIfNotExists` + `AIChat/RecordChatMessage`.
- Anything that **costs credits** → call `Credits/ConsumeCredits` and `TokenUsage/RecordTokenUsage` from the AI use case.
- Anything that **ingests a document** → route through `Source/GenerateAgentSource`, which dispatches to `Pdf/*` or `OCR/ExtractOcrText` and finally `ArtificialIntelligence/LoadVectorStore`.
- Anything **money-related** → `Payment` writes/reads, `Credits` for the ledger, `Stripe` events arrive at `Payment/StripeWebhook`.
- **Inbound channel** (WhatsApp / embed) → channel scope (`Whatsapp`, `Organization/PublicEmbed`) → `Session` → `AIChat`.

## Where to Add New Code (decision rules)

1. **A new endpoint that talks to end users** → `AIChat/<NewUseCase>/`.
2. **A new endpoint for org owners managing their tenant** → `Organization`, `User`, or `Source` depending on the entity it edits.
3. **A new LLM capability, tool, or prompt rule** → `ArtificialIntelligence/<NewUseCase>/`. Don't add LLM logic inside `AIChat`.
4. **A new ingestion format** (e.g., DOCX, audio transcript) → new sibling scope **only if** it's a new media type; otherwise extend `Pdf` or `OCR`.
5. **A new payment surface** → `Payment` for Stripe-side flows, `Credits` for ledger-side effects. Webhook handlers always live in `Payment/StripeWebhook`.
6. **A new channel** (e.g., Telegram, Instagram DMs) → new scope mirroring `Whatsapp/`.
7. **A read-only reporting endpoint** → `Report` if conversation-centric, `Dashboard`/`Analytics` if aggregate metrics.

## Anti-Patterns to Avoid

- **Don't put LLM/RAG logic in `AIChat`** — it belongs in `ArtificialIntelligence`. `AIChat` is the channel-agnostic chat surface; `ArtificialIntelligence` owns model/tool decisions.
- **Don't read from Stripe outside `Payment`** — other scopes consume the local `payment`/`credit_balance`/`subscription` entities populated by `Payment/StripeWebhook`.
- **Don't bypass `Session/CreateSessionIfNotExists`** — every persisted message must belong to a session, and the use case is idempotent for a reason.
- **Don't call `ConsumeCredits` from a controller** — it belongs inside the AI use case so credit accounting and the LLM call are co-located.
- **Don't ingest documents directly from a controller** — go through `Source/GenerateAgentSource` so vector-store writes and source-table writes stay consistent.
