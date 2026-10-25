---
trigger: glob
description: 'Integrações externas: provedores em src/infrastructure/providers/, tokens, modo mock, ResilientClient e checklist para novos provedores.'
globs: 'src/infrastructure/**'
---

# Integrações externas

Cobre: como qualquer recurso externo ao processo (API de terceiros, provedor de IA, banco vetorial, armazenamento em nuvem) é acessado. Aplica-se a todos os provedores em `src/infrastructure/providers/`.

<regra critica="true">
```
Fonte externa → Provider (factory/client) → Service (contrato) → Domínio
```

- Apenas `src/infrastructure/` faz chamadas de rede ou utiliza SDKs de fornecedores.
- Um módulo de domínio (`src/modules/`) nunca importa cliente HTTP, SDK externo, `fetch` ou `axios`. O comando `grep -rE "axios|fetch\(" src/modules` deve permanecer sempre vazio.
- A camada de infraestrutura expõe serviços externos por meio de tokens e interfaces definidos em `src/infrastructure/providers/<name>.provider.ts`.
- `InfrastructureModule` é `@Global()`. Casos de uso e módulos de domínio injetam os tokens diretamente (`@Inject(TOKEN)`), sem importar `InfrastructureModule`.
</regra>

## Estrutura

<estrutura>
```
src/infrastructure/
  infrastructure.module.ts   @Global(): agrega todos os provedores e os exporta
  infrastructure.health.ts   Estado por integração externa para GET /health/ready
  http-client/               ResilientClient, circuit breaker, backoff, proteção SSRF
  providers/
    <name>.provider.ts       Constantes de token, interfaces e definições de Provider[] (live + mock)
```
</estrutura>

Provedores existentes hoje em `src/infrastructure/providers/`:

- `anthropic.provider.ts`: `CHAT_MODEL_SERVICE`, `IChatModelService` (factory de `ChatAnthropic` compatível com Anthropic e DeepSeek)
- `voyage.provider.ts`: `EMBEDDINGS_SERVICE`, `RERANKER_SERVICE`, `IEmbeddingsService`, `IRerankerService` (`voyage-3-large` e `rerank-2.5`)
- `supabase.provider.ts`: `SUPABASE_CLIENT`, `VECTOR_STORE_SERVICE`, `IVectorStoreService` (pgvector / tabela `documents`)
- `twilio.provider.ts`: `TWILIO_CLIENT`, `TWILIO_SERVICE`, `ITwilioService` (WhatsApp via Twilio)
- `gcp-storage.provider.ts`: `GCP_STORAGE_SERVICE`, `IGcpStorageService` (upload e gestão de arquivos no Google Cloud Storage)
- `text-to-speech.provider.ts`: `TEXT_TO_SPEECH_SERVICE`, `ITextToSpeechService` (Google Cloud TTS como padrão ou ElevenLabs via `TTS_PROVIDER=elevenlabs`)
- `google-vision.provider.ts`: `GOOGLE_VISION_SERVICE`, `IGoogleVisionService` (OCR via Google Cloud Vision)
- `spider.provider.ts`: `SPIDER_SERVICE`, `ISpiderService` (web crawling via Spider)
- `tavily.provider.ts`: `TAVILY_SEARCH_SERVICE`, `ITavilySearchService` (busca web em tempo real via `@langchain/tavily`)

## Anatomia de um provedor e modo Mock

<exemplo>
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
</exemplo>

<regras>
- Cada arquivo de provedor de integração vive em `src/infrastructure/providers/<name>.provider.ts`.
- Ele exporta constantes de token string (ex.: `export const VECTOR_STORE_SERVICE = 'VECTOR_STORE_SERVICE'`), interfaces TypeScript (`IVectorStoreService`) e um array `Provider[]`.
- Credenciais ausentes **nunca** quebram o boot da aplicação: um provedor live sem credenciais reporta `NOT_CONFIGURED` em `infrastructure.health.ts` e lança `ServiceUnavailableException` (com mensagem em português) somente quando invocado. Clientes do Google Cloud dependem de ADC e inicializam sob demanda (`READY`).
- `env.INTEGRATION_MODE` (`mock` | `live`) é avaliado dentro do `useFactory` de cada provedor. Nos testes (`NODE_ENV=test`), a aplicação recebe automaticamente as implementações mock em memória.
- Os domínios consomem pelo token: `constructor(@Inject(VECTOR_STORE_SERVICE) private readonly vectorStore: IVectorStoreService) {}` — sem precisar importar nenhum módulo de infraestrutura.
- Uma busca vetorial custa duas chamadas à API da Voyage (embedding + rerank) na mesma `VOYAGEAI_API_KEY`; sem método de pagamento padrão na conta Voyage, o limite cai para 3 RPM / 10K TPM (PC-007).
</regras>

## Cliente HTTP resiliente (`ResilientClient`)

<regras>
- Chamadas HTTP escritas manualmente passam obrigatoriamente pelo `ResilientClient` (`src/infrastructure/http-client/`); não escreva outro loop de retry. SDKs de fornecedores mantêm sua própria pilha HTTP (PC-013).
- Timeout por chamada via `AbortController`.
- Retentativa com backoff exponencial + jitter apenas em métodos idempotentes (`GET`, `HEAD`, `OPTIONS`) e nos status `408`, `425`, `429`, `500`, `502`, `503` e `504` (exceto onde o chamador explicitar política segura para POST idempotente, como o reranker).
- Circuit breaker isolado por dependência externa.
- Proteção contra SSRF: permite apenas protocolos `http:` e `https:`; bloqueia loopback, redes privadas, link-local e hosts de metadados de nuvem; valida o destino contra a allowlist `env.HTTP_ALLOWED_HOSTS` (padrão `api.voyageai.com`). Um novo host acessado via `ResilientClient` deve ser adicionado à allowlist.
- `redirect: 'error'`.
- Propaga automaticamente o `x-request-id` da requisição atual.
- Os parâmetros vêm de `env.HTTP_*` (`HTTP_TIMEOUT_MS`, `HTTP_RETRIES`, `HTTP_BACKOFF_BASE_MS`, `HTTP_CIRCUIT_FAILURE_THRESHOLD`, `HTTP_CIRCUIT_OPEN_MS`).
</regras>

## Checklist para criar um novo provedor

<checklist>
- [ ] Criar `src/infrastructure/providers/<name>.provider.ts`.
- [ ] Exportar constantes de token (`<NAME>_SERVICE`, `<NAME>_CLIENT` quando aplicável).
- [ ] Exportar contrato de interface (`I<Name>Service`).
- [ ] Implementar a classe live e a classe mock de fallback (para `env.INTEGRATION_MODE === 'mock'`).
- [ ] Exportar `<Name>Provider: Provider[]` com `useFactory`.
- [ ] Registrar e exportar no `InfrastructureModule` (`src/infrastructure/infrastructure.module.ts`).
- [ ] Adicionar verificação de estado no health check em `src/infrastructure/infrastructure.health.ts`.
- [ ] Adicionar credenciais e hosts permitidos em `src/shared/config/env.ts` e `.env.example`.
- [ ] Testar unitariamente os métodos mock e live em `<name>.provider.spec.ts`.
</checklist>
```
