# Integrações externas

Vale para qualquer dependência fora do processo: API de terceiro, provedor de IA, data lake, serviço de outro time.

<regra critica="true">
```
Fonte externa → Conector → Contrato externo → Mapeador → Contrato interno → Domínio
```

- Somente `src/infrastructure/integration/` faz chamada de rede a fonte externa.
- Módulo de domínio nunca importa cliente HTTP nem usa `fetch`/axios.
- Nome de campo da fonte externa nunca aparece fora de `<fonte>.contracts.ts` e `<fonte>.mappers.ts`.

Campo externo fora do mapeador espalha a troca de fonte por todos os domínios que o leem.
</regra>

## Estrutura

<estrutura>
```
src/infrastructure/integration/
  integration.module.ts       @Global, publica as portas
  <nome>.port.ts              token + interface consumida pelo domínio
  source-registry.ts          fontes, capacidades, caminho, schema e mapeador
  contracts/                  contratos internos (Zod) + proveniência
  core/                       Connector, HttpConnector, MockConnector, Normalizer
  http-client/                ResilientClient, circuit breaker, backoff, SSRF guard
  <fonte>/
    <fonte>.contracts.ts      schema Zod do payload externo
    <fonte>.mappers.ts        funções puras externo → interno
    <fonte>.mappers.spec.ts
    <fonte>.client.ts         só para chamada imperativa síncrona
```
</estrutura>

## Contratos

<exemplo>
```ts
// gateway-pagamento/gateway-pagamento.contracts.ts
export const cobrancaExternaSchema = z.object({
  CD_COBRANCA: z.string(),
  VL_TOTAL: z.number(),
  ST_COBRANCA: z.string(),
});
export type CobrancaExterna = z.infer<typeof cobrancaExternaSchema>;
```

```ts
// contracts/provenance.ts
export const EXTERNAL_SOURCES = ['GATEWAY_PAGAMENTO', 'ERP'] as const;

export const provenanceSchema = z.object({
  source: z.enum(EXTERNAL_SOURCES),
  collectedAt: z.iso.datetime(),
  snapshotVersion: z.string().min(1),
  sourceRecordId: z.string().min(1),
});

export function withProvenance<T extends z.ZodRawShape>(shape: T) {
  return z.object({ ...shape, provenance: provenanceSchema });
}
```

```ts
// contracts/pagamento.ts
export const cobrancaSchema = withProvenance({
  codigo: z.string(),
  valorTotal: z.number(),
  status: z.enum(['pendente', 'paga', 'cancelada']),
});
export type Cobranca = z.infer<typeof cobrancaSchema>;
```

</exemplo>

<regras>
- Contrato externo usa exatamente os nomes de campo que a fonte devolve.
- Contrato interno usa o vocabulário do domínio e é validado com Zod na saída do mapeador.
- Todo registro normalizado carrega `provenance`.
</regras>

## Mapeador

<exemplo>
```ts
// gateway-pagamento/gateway-pagamento.mappers.ts
const STATUS: Record<string, Cobranca['status']> = { P: 'pendente', G: 'paga', C: 'cancelada' };

export function createCobrancaMapper(context: CollectionContext): Mapper<CobrancaExterna, Cobranca> {
return {
identify: (externo) => externo.CD_COBRANCA,
map: (externo, sourceRecordId) => ({
codigo: externo.CD_COBRANCA,
valorTotal: externo.VL_TOTAL,
status: STATUS[externo.ST_COBRANCA],
provenance: buildProvenance(context, sourceRecordId),
}),
};
}

````
</exemplo>

<regras>
- Função pura, sem I/O.
- Valor sem tradução fica `undefined` e o registro é rejeitado pelo schema interno. Nunca assumir valor padrão.
- Todo mapeador tem `*.spec.ts`.
</regras>

## Conector

<exemplo>
```ts
// core/connector.port.ts
export interface Connector<TExternal> {
  readonly source: ExternalSource;
  readonly capability: Capability;
  state(): 'READY' | 'NOT_CONFIGURED';
  collect(params: CollectionParams): Promise<readonly TExternal[]>;
}

export interface Mapper<TExternal, TInternal> {
  identify(external: TExternal): string;
  map(external: TExternal, sourceRecordId: string): TInternal;
}
````

</exemplo>

<regras>
- Coleta de registros usa o `HttpConnector` genérico. Não criar classe de cliente por fonte.
- Capacidade nova = entrada em `source-registry.ts` (caminho, schema externo, fábrica de mapeador) + `<fonte>.contracts.ts` + `<fonte>.mappers.ts`.
- `Normalizer` aplica mapeador e schema interno a cada registro e retorna `{ accepted, rejected }`. Registro inválido é rejeitado individualmente, com id de origem e motivo.
- Conector sem URL configurada retorna estado `NOT_CONFIGURED` e `collect()` lança `BadGatewayException`.
</regras>

## Modo mock

<regras>
- `env.INTEGRATION_MODE` (`mock` | `live`) seleciona `MockConnector` ou `HttpConnector`. Default: `mock`.
- Consumidores não mudam entre os modos.
- Toda integração nova nasce com o par mock/real.
</regras>

## Cliente imperativo (chamada síncrona pontual)

<exemplo>
```ts
export type AiResult<T> =
  | { available: true; content: T }
  | { available: false; reason: 'NOT_CONFIGURED' | 'TIMEOUT' | 'UNAVAILABLE' | 'INVALID_RESPONSE' };

@Injectable()
export class AiClient {
private readonly logger = new Logger(AiClient.name);
private readonly client?: ResilientClient;

constructor() {
if (env.SOURCE_AI_URL) {
this.client = new ResilientClient({
name: 'ai-service',
baseUrl: env.SOURCE_AI_URL,
timeoutMs: env.HTTP_TIMEOUT_MS,
retries: env.HTTP_RETRIES,
backoffBaseMs: env.HTTP_BACKOFF_BASE_MS,
circuitFailureThreshold: env.HTTP_CIRCUIT_FAILURE_THRESHOLD,
circuitOpenMs: env.HTTP_CIRCUIT_OPEN_MS,
ssrf: { allowedHosts: env.HTTP_ALLOWED_HOSTS, allowInternalNetwork: false },
});
}
}

async infer(path: string, input: unknown): Promise<AiResult<Inferencia>> {
if (!this.client) {
return { available: false, reason: 'NOT_CONFIGURED' };
}

    let raw: unknown;

    try {
      raw = await this.client.request({ path, method: 'POST', body: input });
    } catch (error: unknown) {
      const reason = error instanceof Error && error.name === 'AbortError' ? 'TIMEOUT' : 'UNAVAILABLE';
      this.logger.warn({ path, reason }, 'ai.unavailable');
      return { available: false, reason };
    }

    const result = aiInferenceSchema.safeParse(raw);

    if (!result.success) {
      this.logger.warn({ path }, 'ai.invalid_response');
      return { available: false, reason: 'INVALID_RESPONSE' };
    }

    return { available: true, content: translateInference(result.data) };

}
}

````
</exemplo>

<regras>
- Usar quando a chamada é requisição/resposta síncrona, não coleta de registros.
- Provedor de IA é integração externa e segue este padrão.
- Dependência opcional retorna resultado discriminado (`available`), não lança exceção.
- Resposta externa é sempre validada com Zod antes de ser traduzida.
</regras>

## Cliente HTTP resiliente

<regras>
- Toda chamada externa usa `ResilientClient`. Não escrever outro laço de retry.
- Timeout por chamada, via `AbortController`.
- Retry com backoff exponencial + jitter, somente em `GET`/`HEAD`/`OPTIONS` e nos status 408, 425, 429, 500, 502, 503, 504.
- Circuit breaker por dependência.
- SSRF guard: apenas http/https; bloqueia loopback, redes privadas, link-local e hosts de metadados de nuvem; allowlist em `env.HTTP_ALLOWED_HOSTS`.
- `redirect: 'error'`.
- Envia o id de correlação do request atual.
- Parâmetros vêm de `env.HTTP_*`.
- Host novo exige inclusão em `HTTP_ALLOWED_HOSTS`.
</regras>

## Exposição ao domínio

<exemplo>
```ts
// fonte-dados.port.ts
export const FONTE_DADOS = Symbol('FONTE_DADOS');

export interface FonteDadosClient {
  listSources(): readonly FonteStatus[];
  collect(capability: Capability, params: CollectionParams): Promise<NormalizationResult<unknown>>;
}
````

```ts
// integration.module.ts
@Global()
@Module({
  providers: [
    Normalizer,
    AiClient,
    FonteDadosService,
    { provide: FONTE_DADOS, useExisting: FonteDadosService },
  ],
  exports: [FONTE_DADOS, AiClient],
})
export class IntegrationModule {}
```

</exemplo>

Consumo em service de domínio:

<exemplo>
```ts
constructor(@Inject(FONTE_DADOS) private readonly fonteDados: FonteDadosClient) {}
```
</exemplo>

<regras>
- Capacidade de escrita na fonte externa ainda não implementada: método existe na porta e lança erro de não implementado.
- Cada upstream tem indicador de saúde (`integration.health.ts`) incluído em `/health/ready`. Upstream não configurado não derruba o boot.
</regras>

## Mensageria

<regras>
- Publicação de evento via porta `EVENT_PUBLISHER` (ver [`06-injecao-dependencia.md`](06-injecao-dependencia.md)).
- Todo evento carrega `id`, `correlationId`, `occurredAt` e `idempotencyKey`.
- Nome do evento: `<recurso>.<acao>.v<versao>` (`pedido.confirmado.v1`).
- Consumidor de mensagem é idempotente e fica em `src/modules/<dominio>/handlers/<evento>.handler.ts`.
- Operações CRUD são síncronas. Assíncrono apenas para processamento demorado ou desacoplado.
</regras>

## Checklist

<checklist>
- [ ] Contrato externo com os nomes exatos da fonte.
- [ ] Mapeador puro, com `*.spec.ts`, rejeitando valor desconhecido.
- [ ] Contrato interno em Zod, com `provenance`.
- [ ] Implementação mock existente e default fora de produção.
- [ ] Chamada via `ResilientClient`.
- [ ] Host na allowlist; URL e parâmetros em `env.ts`.
- [ ] Domínio consome via porta.
</checklist>
