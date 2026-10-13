---
trigger: always_on
---

# External integrations

Owns: how anything outside the process (third-party API, AI provider, vector store, cloud storage) is reached. Applies to every provider in `src/infrastructure/providers/`.

<critical_rule>

```
External source → Provider (factory/client) → Service (contract) → Domain
```

- Only `src/infrastructure/` makes network calls or uses a vendor SDK.
- A domain module never imports an HTTP client, an SDK, `fetch` or axios. `grep -rE "axios|fetch\(" src/modules` stays empty.
- Infrastructure provides external services through tokens and interfaces defined in `src/infrastructure/providers/<name>.provider.ts`.
- `InfrastructureModule` is `@Global()`. Use cases and domain modules inject tokens directly (`@Inject(TOKEN)`), without importing `InfrastructureModule`.
  </critical_rule>

## Structure

<structure>
```
src/infrastructure/
  infrastructure.module.ts   @Global(): aggregates all providers and exports them
  infrastructure.health.ts   per-upstream state for /health/ready
  http-client/               ResilientClient, circuit breaker, backoff, SSRF guard
  providers/
    <name>.provider.ts       Token constants, interfaces, and Provider[] definitions (client + service)
```
</structure>

Providers today:

- `anthropic.provider.ts`: `CHAT_MODEL_SERVICE`, `IChatModelService` (`ChatAnthropic` factory)
- `voyage.provider.ts`: `EMBEDDINGS_SERVICE`, `RERANKER_SERVICE`, `IEmbeddingsService`, `IRerankerService`
- `supabase.provider.ts`: `SUPABASE_CLIENT`, `VECTOR_STORE_SERVICE`, `IVectorStoreService`
- `twilio.provider.ts`: `TWILIO_CLIENT`, `TWILIO_SERVICE`, `ITwilioService`
- `gcp-storage.provider.ts`: `GCP_STORAGE_SERVICE`, `IGcpStorageService`
- `text-to-speech.provider.ts`: `TEXT_TO_SPEECH_SERVICE`, `ITextToSpeechService`
- `google-vision.provider.ts`: `GOOGLE_VISION_SERVICE`, `IGoogleVisionService`
- `spider.provider.ts`: `SPIDER_SERVICE`, `ISpiderService`

## Provider Anatomy and Mock Mode

<example>
```ts
export const SPIDER_SERVICE = 'SPIDER_SERVICE';

export interface ISpiderService {
crawl(url: string, options: SpiderCrawlOptions): Promise<SpiderCrawledPage[]>;
}

export const SpiderProvider: Provider[] = [
{
provide: SPIDER_SERVICE,
useFactory: (): ISpiderService => {
if (env.INTEGRATION_MODE === 'mock') {
return new MockSpiderService();
}
return new LiveSpiderService();
},
},
];

```
</example>

<rules>
- Each integration provider file lives in `src/infrastructure/providers/<name>.provider.ts`.
- It exports string tokens (e.g. `export const VECTOR_STORE_SERVICE = 'VECTOR_STORE_SERVICE'`), TypeScript interfaces, and a `Provider[]` array.
- Missing credentials never break the boot: a live provider without credentials throws `ServiceUnavailableException` only when invoked. Google clients rely on ADC and initialize lazily.
- `env.INTEGRATION_MODE` (`mock` | `live`) is evaluated in the `useFactory` of each provider. Tests automatically receive in-memory mock implementations.
- Domains consume by token: `constructor(@Inject(VECTOR_STORE_SERVICE) private readonly vectorStore: IVectorStoreService) {}` — no module import required.
</rules>

## Resilient HTTP client

<rules>
- Hand-written HTTP goes through `ResilientClient` (`src/infrastructure/http-client/`); do not write another retry loop. Vendor SDKs keep their own stack (PC-013).
- Per-call timeout via `AbortController`.
- Retry with exponential backoff + jitter only on `GET`/`HEAD`/`OPTIONS` and on 408, 425, 429, 500, 502, 503, 504.
- Circuit breaker per dependency.
- SSRF guard: http/https only; loopback, private networks, link-local and cloud metadata hosts blocked; allowlist in `env.HTTP_ALLOWED_HOSTS` (default `api.voyageai.com`). A new host goes into the allowlist.
- `redirect: 'error'`.
- Propagates the current `x-request-id`.
- Parameters come from `env.HTTP_*` (`HTTP_TIMEOUT_MS`, `HTTP_RETRIES`, `HTTP_BACKOFF_BASE_MS`, `HTTP_CIRCUIT_FAILURE_THRESHOLD`, `HTTP_CIRCUIT_OPEN_MS`).
</rules>

## Checklist for a new provider

<checklist>
- [ ] Create `src/infrastructure/providers/<name>.provider.ts`.
- [ ] Export string tokens (`<NAME>_SERVICE`, `<NAME>_CLIENT` if applicable).
- [ ] Export interface contract (`I<Name>Service`).
- [ ] Implement live service class and mock fallback class (for `INTEGRATION_MODE === 'mock'`).
- [ ] Export `<Name>Provider: Provider[]` with `useFactory`.
- [ ] Register and export in `src/infrastructure/infrastructure.module.ts`.
- [ ] Add upstream health checking in `src/infrastructure/infrastructure.health.ts`.
- [ ] Add credentials/hosts in `env.ts` and `.env.example`.
- [ ] Unit test mock and service methods in `<name>.provider.spec.ts`.
</checklist>
```
