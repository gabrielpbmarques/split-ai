---
trigger: always_on
---

# External integrations

Owns: how anything outside the process (third-party API, AI provider, vector store, external database) is reached. Applies to every port in `src/infrastructure/integration/`.

<critical_rule>

```
External source → Gateway (adapter) → External contract (Zod) → Mapper (pure) → Internal type → Domain
```

- Only `src/infrastructure/integration/` makes network calls or uses a vendor SDK.
- A domain module never imports an HTTP client, an SDK, `fetch` or axios. `grep -rE "axios|fetch\(" src/modules` stays empty (the only hit is browser-side JS inside an HTML template, if any).
- External field names never appear outside `<source>.contracts.ts` and `<source>.mappers.ts`.

An external field outside the mapper spreads the cost of swapping the source across every domain that reads it.
</critical_rule>

## Structure

<structure>
```
src/infrastructure/integration/
  integration.module.ts      @Global(): publishes every port, choosing live or mock per INTEGRATION_MODE
  integration.health.ts      per-upstream state for /health/ready
  integration.state.ts       IntegrationGateway { name; state() }, IntegrationState, notConfigured()
  <name>.port.ts             Symbol token + interface consumed by domains
  http-client/               ResilientClient, circuit breaker, backoff, SSRF guard
  mock/                      in-memory implementation of every port
  <source>/
    <source>.contracts.ts    Zod schema of the external payload, exact external field names
    <source>.mappers.ts      pure functions external → internal
    <source>.mappers.spec.ts
    <source>-<port>.gateway.ts   the adapter implementing the port
```
</structure>

Ports today: `MESSAGING` (Twilio WhatsApp), `EMBEDDINGS` (Voyage), `VECTOR_STORE` (Supabase pgvector), `RERANKER` (Voyage `rerank-2.5`), `CHAT_MODEL` (`ChatAnthropic` factory — the only `new ChatAnthropic` in the repo), `SITE_CRAWLER` (Spider), `FILE_STORAGE` (GCS), `TEXT_TO_SPEECH` (Google, or ElevenLabs via `TTS_PROVIDER`), `OCR` (Google Vision), `CUSTOMER_DATABASE` (per-request TypeORM `DataSource` to an agent's external database).

## Contracts and mappers

<rules>
- The external contract uses exactly the field names the source returns, validated with Zod.
- A payload outside the contract is rejected — `BadRequestException` for inbound webhooks, `BadGatewayException` for upstream responses — never defaulted.
- Mappers are pure functions without I/O. A value with no translation stays `undefined` and the record is rejected; never assume a default.
- Every mapper has a `*.spec.ts`.
</rules>

## Gateways and mock mode

<example>
```ts
export class SpiderSiteCrawlerGateway implements SiteCrawler {
  readonly name = 'spider';

state(): IntegrationState {
return env.SPIDER_API_KEY ? 'READY' : 'NOT_CONFIGURED';
}

async crawl(url: string, options: CrawlOptions): Promise<CrawledPage[]> {
if (!env.SPIDER_API_KEY) notConfigured(this.name);

    const documents = await new SpiderLoader({ apiKey: env.SPIDER_API_KEY, url, params: { limit: options.limit } }).load();
    return documents.flatMap((document) => {
      const parsed = spiderDocumentSchema.safeParse(document);
      return parsed.success ? [mapSpiderDocument(parsed.data)] : [];
    });

}
}

```
</example>

<rules>
- Every port interface extends `IntegrationGateway` (`name`, `state()`).
- A live gateway without its credential reports `NOT_CONFIGURED` and throws `ServiceUnavailableException` only when called. Missing credentials never break the boot. Google clients rely on ADC and are built lazily (`READY`).
- `env.INTEGRATION_MODE` (`mock` | `live`) selects the implementation through `select(live, mock)` in `integration.module.ts`. Default: `mock` when `NODE_ENV=test`, `live` otherwise (conscious deviation: existing dev `.env` files carry real keys).
- Consumers do not change between modes. Every new integration ships with its live/mock pair.
- Domains consume by token: `constructor(@Inject(SITE_CRAWLER) private readonly crawler: SiteCrawler) {}` — no module import.
</rules>

## Imperative calls and optional dependencies

<rules>
- A synchronous request/response call (an AI provider, a reranker) is a gateway method that validates the response with Zod before translating it.
- An optional dependency may return a discriminated result (`{ available: true, content } | { available: false, reason }`) instead of throwing, when the caller can degrade gracefully.
- A write capability not implemented yet exists on the port and throws a not-implemented error.
</rules>

## Resilient HTTP client

<rules>
- Hand-written HTTP goes through `ResilientClient`; do not write another retry loop. Vendor SDKs keep their own stack (PC-013).
- Per-call timeout via `AbortController`.
- Retry with exponential backoff + jitter only on `GET`/`HEAD`/`OPTIONS` and on 408, 425, 429, 500, 502, 503, 504.
- Circuit breaker per dependency.
- SSRF guard: http/https only; loopback, private networks, link-local and cloud metadata hosts blocked; allowlist in `env.HTTP_ALLOWED_HOSTS` (default `api.voyageai.com`). A new host goes into the allowlist.
- `redirect: 'error'`.
- Propagates the current `x-request-id`.
- Parameters come from `env.HTTP_*` (`HTTP_TIMEOUT_MS`, `HTTP_RETRIES`, `HTTP_BACKOFF_BASE_MS`, `HTTP_CIRCUIT_FAILURE_THRESHOLD`, `HTTP_CIRCUIT_OPEN_MS`).
</rules>

## `CUSTOMER_DATABASE`

<rules>
- Opens a short-lived TypeORM `DataSource` per request to the database URL configured **on the agent** (`agents.database_url`).
- Validates the host against `CUSTOMER_DATABASE_ALLOWED_HOSTS`; internal networks only with `CUSTOMER_DATABASE_ALLOW_INTERNAL_NETWORK=true`; applies `CUSTOMER_DATABASE_*_TIMEOUT_MS`.
- The SQL guard (`detectDialect`, `sanitizeSqlQuery`, `assertScoped`) is the pure module `customer-database/sql-guard.ts` with its spec; see `agent-tools.md` for the guardrails the `execute_sql` tool must keep.
- `database_url` is a secret: never log it or return it in an API response.
</rules>

## Checklist for a new integration

<checklist>
- [ ] Port (`<name>.port.ts`) with a token and an interface holding only what consumers use.
- [ ] External contract with the exact external field names (Zod).
- [ ] Pure mapper with `*.spec.ts`, rejecting unknown values.
- [ ] Live gateway with `state()` and `NOT_CONFIGURED` handling; mock in `mock/`.
- [ ] Registered in `integration.module.ts` with `select(live, mock)` and in `integration.health.ts`.
- [ ] Hand-written HTTP through `ResilientClient`, host in `HTTP_ALLOWED_HOSTS`.
- [ ] Credentials and URLs in `env.ts` and `.env.example`.
</checklist>
```
