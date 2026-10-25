# O arquivo `*.module.ts`

Todo `*.module.ts` assume exatamente um de três papéis.

<tabela>

| Papel                        | Local                                                      | `controllers`             | `providers`                      | Quantidade                |
| ---------------------------- | ---------------------------------------------------------- | ------------------------- | -------------------------------- | ------------------------- |
| Caso de uso                  | `modules/<dominio>/<caso-de-uso>/<caso-de-uso>.module.ts`  | 1 (0 se auxiliar interno) | service do caso de uso           | 1 por caso de uso         |
| Agregador de domínio         | `modules/<dominio>/<dominio>.module.ts`                    | nunca                     | nunca                            | 1 por domínio             |
| Repositório / infraestrutura | `modules/<dominio>/repositories/**` ou `infrastructure/**` | nunca                     | repositório ou tokens do recurso | 1 por agregado ou recurso |

</tabela>

## 1. Módulo de caso de uso

<exemplo>
```ts
import { Module } from '@nestjs/common';

import { ModuloExecutorTransacao } from 'src/infrastructure/database/executor-transacao/executor-transacao.module';
import { CriarPedidoController } from 'src/modules/pedidos/criar-pedido/criar-pedido.controller';
import { CriarPedidoService } from 'src/modules/pedidos/criar-pedido/criar-pedido.service';
import { ModuloRepositorioPedidos } from 'src/modules/pedidos/repositories/pedido-repository.module';

@Module({
imports: [ModuloRepositorioPedidos, ModuloExecutorTransacao],
controllers: [CriarPedidoController],
providers: [CriarPedidoService],
exports: [CriarPedidoService],
})
export class CriarPedidoModule {}

````
</exemplo>

<regras>
- Contém apenas fiação.
- Importa somente os módulos de repositório que o service usa. Não existe módulo agregador de repositórios.
- Importa `ModuloExecutorTransacao` somente se o service abre transação.
- Sempre exporta o service.
- Para usar o service de outro caso de uso, importa o módulo daquele caso de uso.
</regras>

## 2. Módulo agregador de domínio

<exemplo>
```ts
import { Module } from '@nestjs/common';

import { BuscarPedidoModule } from 'src/modules/pedidos/buscar-pedido/buscar-pedido.module';
import { CriarPedidoModule } from 'src/modules/pedidos/criar-pedido/criar-pedido.module';
import { ListarPedidosModule } from 'src/modules/pedidos/listar-pedidos/listar-pedidos.module';

@Module({
  imports: [CriarPedidoModule, ListarPedidosModule, BuscarPedidoModule],
  exports: [CriarPedidoModule, ListarPedidosModule, BuscarPedidoModule],
})
export class PedidosModule {}
````

</exemplo>

<regras>
- Apenas `imports` e `exports`, com a mesma lista de módulos de caso de uso.
- Nunca declara `controllers` nem `providers`.
- É o único módulo do domínio importado em `AppModule`.
- Caso de uso novo: adicionar uma entrada em `imports` e em `exports`.
</regras>

## 3. Módulo de repositório / infraestrutura

<exemplo>
```ts
@Module({
  imports: [ModuloBancoDeDados],
  providers: [RepositorioPedidos],
  exports: [RepositorioPedidos],
})
export class ModuloRepositorioPedidos {}
```

```ts
@Module({
  providers: [
    { provide: POOL_PG, useFactory: async (): Promise<Pool> => criarPool() },
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

<regras>
- Um módulo de repositório por agregado: importa `ModuloBancoDeDados`, provê e exporta uma única classe de repositório.
- Módulo que gerencia recurso com ciclo de vida (pool, cliente de fila) implementa `OnApplicationShutdown` e encerra o recurso.
- Módulos de repositório e infraestrutura de banco usam prefixo `Modulo`; módulos de caso de uso e de domínio usam sufixo `Module`.
- Módulos de integração e mensageria que publicam porta são `@Global()` (ver [`06-injecao-dependencia.md`](06-injecao-dependencia.md)).
</regras>
