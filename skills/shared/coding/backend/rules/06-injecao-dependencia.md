# Injeção de dependência

<tabela>

| Mecanismo                                    | Quando usar                                                                                | Exemplos                                   |
| -------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------ |
| Classe concreta                              | Implementador único. Padrão para services, repositórios e `ExecutorTransacao`              | `RepositorioPedidos`, `CriarPedidoService` |
| `Symbol` + `useFactory`                      | Recurso de infraestrutura que exige construção (configuração, conexão)                     | `DRIZZLE`, `POOL_PG`                       |
| `Symbol` + interface + `useExisting` (porta) | Implementação troca por ambiente (mock vs. real) ou capacidade consumida por outro domínio | `FONTE_DADOS`, `EVENT_PUBLISHER`           |

</tabela>

<checklist>
Decisão, em ordem:

1. Repositório de banco → classe concreta.
2. Recurso de infraestrutura com construção não trivial → `Symbol` + `useFactory`.
3. Implementação troca por ambiente, ou outro domínio consome a capacidade → porta.
4. Qualquer outro caso → classe concreta.
</checklist>

## Classe concreta

<exemplo>
```ts
@Injectable()
export class CriarPedidoService {
  constructor(
    private readonly pedidos: RepositorioPedidos,
    private readonly executorTransacao: ExecutorTransacao,
  ) {}
}
```
</exemplo>

<regras>
- Injeção sempre por construtor, com `private readonly`.
- A classe injetada é importada com import normal, nunca `import type`.
- Todo `@Injectable()` consta em `providers` de algum módulo.
- Para injetar provider de outro módulo: importar o módulo que o exporta.
- Sem dependência circular entre módulos.
</regras>

## `Symbol` + `useFactory`

<exemplo>
```ts
// src/infrastructure/database/banco-de-dados.tokens.ts
export const DRIZZLE = Symbol('DRIZZLE');
export const POOL_PG = Symbol('POOL_PG');
```

```ts
// src/infrastructure/database/banco-de-dados.types.ts
export type Schema = typeof schema;
export type BancoDeDados = NodePgDatabase<Schema> & { $client: Pool };
export type Transacao = Parameters<
  Parameters<BancoDeDados['transaction']>[0]
>[0];
export type Executor = BancoDeDados | Transacao;
```

```ts
// src/infrastructure/database/banco-de-dados.module.ts
@Module({
  providers: [
    {
      provide: POOL_PG,
      useFactory: async (): Promise<Pool> => {
        const pool = new Pool({
          connectionString: env.DATABASE_URL,
          min: env.DATABASE_POOL_MIN,
          max: env.DATABASE_POOL_MAX,
          idleTimeoutMillis: 30_000,
          connectionTimeoutMillis: 10_000,
          statement_timeout: 30_000,
          query_timeout: 30_000,
          idle_in_transaction_session_timeout: 60_000,
          keepAlive: true,
        });

        pool.on('error', (erro) => {
          logger.error(erro);
        });

        const sonda = await pool.connect();
        sonda.release();

        return pool;
      },
    },
    {
      provide: DRIZZLE,
      inject: [POOL_PG],
      useFactory: (pool: Pool): BancoDeDados =>
        drizzle({ client: pool, schema, casing: 'snake_case' }),
    },
  ],
  exports: [DRIZZLE, POOL_PG],
})
export class ModuloBancoDeDados implements OnApplicationShutdown {
  constructor(@Inject(POOL_PG) private readonly pool: Pool) {}

  async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
  }
}
```

</exemplo>

Consumo:

<exemplo>
```ts
constructor(@Inject(DRIZZLE) private readonly db: BancoDeDados) {}
```
</exemplo>

<regras>
- Tokens ficam em arquivo `*.tokens.ts` e são sempre `Symbol`, nunca string.
- `DRIZZLE` só é injetado em repositórios e em `ExecutorTransacao`.
- `new Pool(...)` e `drizzle(...)` existem apenas em `ModuloBancoDeDados`.
</regras>

## Porta (`Symbol` + interface + `useExisting`)

<exemplo>
```ts
// src/infrastructure/messaging/event-publisher.port.ts
export const EVENT_PUBLISHER = Symbol('EVENT_PUBLISHER');

export interface EventPublisher {
publish<T>(event: EventToPublish<T>): Promise<EventEnvelope<T>>;
}

````

```ts
// src/infrastructure/messaging/messaging.module.ts
@Global()
@Module({
  providers: [PubSubEventPublisher, { provide: EVENT_PUBLISHER, useExisting: PubSubEventPublisher }],
  exports: [EVENT_PUBLISHER],
})
export class MessagingModule {}
````

</exemplo>

Consumo:

<exemplo>
```ts
constructor(@Inject(EVENT_PUBLISHER) private readonly eventos: EventPublisher) {}
```
</exemplo>

<regras>
- Token e interface ficam no mesmo arquivo `*.port.ts`.
- Porta de infraestrutura: `src/infrastructure/<recurso>/<nome>.port.ts`.
- Porta de domínio consumida por outro domínio: `src/modules/<dominio>/contracts/<nome>.port.ts`.
- Vincular com `useExisting`, registrando também a classe concreta como provider.
- O módulo exporta o token, não a classe concreta.
- A interface contém apenas os métodos que o consumidor usa.
- Consumidores injetam pelo token e tipam pela interface.
- Não criar porta sem consumidor ou sem segunda implementação real.
</regras>
