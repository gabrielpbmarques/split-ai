# Banco de dados

## Schema

<estrutura>
```
src/infrastructure/database/
  banco-de-dados.module.ts     providers POOL_PG e DRIZZLE
  banco-de-dados.tokens.ts
  banco-de-dados.types.ts      BancoDeDados, Transacao, Executor
  executor-transacao/          ExecutorTransacao + módulo
  migrar.ts                    aplica migrations
  popular.ts                   seed
  repositories/                repositórios transversais (ex.: log de auditoria)
  schema/
    colunas.ts                 colunas reutilizadas
    relacoes.ts                todas as relations()
    <tabela>.schema.ts         um arquivo por tabela
    index.ts                   barrel
```
</estrutura>

<exemplo>
```ts
// schema/colunas.ts
import { timestamp } from 'drizzle-orm/pg-core';

export const colunasCicloDeVida = {
createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
.notNull()
.defaultNow()
.$onUpdate(() => new Date()),
deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
};

````

```ts
// schema/pedidos.schema.ts
import { sql } from 'drizzle-orm';
import { check, index, pgEnum, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';

import { colunasCicloDeVida } from './colunas';
import { usuarios } from './usuarios.schema';

export const statusPedido = pgEnum('status_pedido', ['rascunho', 'confirmado', 'cancelado']);
export type StatusPedido = (typeof statusPedido.enumValues)[number];

export const pedidos = pgTable(
  'pedidos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    codigo: varchar('codigo', { length: 60 }).notNull(),
    status: statusPedido('status').notNull().default('rascunho'),
    idUsuarioCriador: uuid('id_usuario_criador')
      .notNull()
      .references(() => usuarios.id, { onDelete: 'restrict' }),
    confirmadoEm: timestamp('confirmado_em', { withTimezone: true, mode: 'date' }),
    ...colunasCicloDeVida,
  },
  (tabela) => [
    uniqueIndex('pedidos_codigo_uq').on(tabela.codigo).where(sql`${tabela.deletedAt} is null`),
    index('pedidos_status_idx').on(tabela.status),
    check('pedidos_codigo_nao_vazio', sql`length(${tabela.codigo}) > 0`),
  ],
);
````

```ts
// schema/relacoes.ts
export const relacoesPedidos = relations(pedidos, ({ one, many }) => ({
  criador: one(usuarios, {
    fields: [pedidos.idUsuarioCriador],
    references: [usuarios.id],
  }),
  itens: many(itensPedido),
}));
```

</exemplo>

<regras>
- Todas as tabelas ficam em `src/infrastructure/database/schema/`. Módulo de domínio não declara tabela.
- Um arquivo por tabela: `<tabela>.schema.ts`, exportado pelo `index.ts`.
- Todas as `relations()` ficam em `relacoes.ts`.
- Arquivos do schema usam import relativo entre si.
- Nome de tabela e coluna sempre explícito, em snake_case. Propriedade em camelCase.
- PK: `uuid('id').primaryKey().defaultRandom()`.
- Todo `timestamp` usa `{ withTimezone: true, mode: 'date' }`.
- Terceiro argumento de `pgTable` é callback que retorna array.
- Enum: `pgEnum` declarado no arquivo da tabela + tipo derivado exportado.
- FK declara `onDelete` explicitamente. FK auto-referenciada usa `(): AnyPgColumn => tabela.coluna`.
- `varchar` sempre com `length`.
- `jsonb` usa `.$type<T>()` e default `'{}'::jsonb`.
- Nomes: índice `<tabela>_<finalidade>_idx`; único `<tabela>_<finalidade>_uq`; check `<tabela>_<regra>`.
- Invariante de dado (intervalo de datas, campo obrigatório condicional) também é `check` no banco.
- Client Drizzle criado com `casing: 'snake_case'`, igual ao `drizzle.config.ts`.
</regras>

## Ciclo de vida e exclusão lógica

<regra critica="true">
Toda tabela inclui `...colunasCicloDeVida`. `DELETE` físico é proibido: excluir é preencher `deleted_at`.

Exclusão física apaga o histórico referenciado pela auditoria e falha nas FKs com `onDelete: 'restrict'`.
</regra>

<regras>
- `created_at`, `updated_at` e `deleted_at` nunca são atribuídos por service.
- Toda leitura de repositório filtra `deleted_at IS NULL`. Em `join`, filtra nos dois lados.
- Todo índice único é parcial: `WHERE deleted_at IS NULL`.
- Exclusão não cascateia.
- `deleted_at` não representa estado de negócio. Estado usa coluna própria: `status`, `revogado_em`, `valido_ate`, `cancelado_em`.
- Exceção: tabelas de auditoria/trilha imutável não têm as três colunas; usam `registrado_em` e não aceitam `UPDATE` nem exclusão.
</regras>

<exemplo>
```ts
async remover(id: string, tx?: Executor): Promise<void> {
  await this.executor(tx)
    .update(pedidos)
    .set({ deletedAt: new Date() })
    .where(and(eq(pedidos.id, id), isNull(pedidos.deletedAt)));
}
```
</exemplo>

## Projeção e listagem

<regra critica="true">
A forma do payload de uma listagem é decidida no `select`, nunca iterando o resultado em memória. Uma lista com milhares de linhas percorrida item a item para "normalizar" campos é custo de CPU e de memória que o banco já resolve de graça na projeção.
</regra>

<regras>
- Método de listagem no repositório tem a assinatura `listar<TCampo extends keyof Linha = keyof Linha>(campos?: readonly TCampo[], tx?: Executor): Promise<Pick<Linha, TCampo>[]>`. Para listagem com filtro ou paginação, `campos` vem depois dos filtros e antes de `tx`.
- A projeção é construída por `selecionarColunas(tabela, campos)` (colunas de uma tabela) ou `selecionarCampos(mapaDeCampos, campos)` (mapa que mistura coluna e expressão `sql`), ambos em `src/infrastructure/database/selecao-campos.ts`. Sem `campos`, o método devolve todas as colunas.
- O service declara os campos que expõe em uma constante `as const satisfies readonly (keyof Modelo)[]` e devolve a lista do repositório sem tocá-la.
- Coluna que não deve sair não entra no `select`. Linha que não deve sair fica fora pelo `where`. Campo calculado (contagem, agregação, apelido) entra como expressão `sql` no mapa de campos, com `leftJoinLateral` quando a mesma expressão alimenta mais de um campo.
- Lista de ids relacionados (`idsPermissoes`, `idsItens`) sai do banco já como `string[]` via `array_agg`, em método próprio (`buscarIds…`). Não se busca a linha inteira para depois extrair o id.
- Paginação: página e total são duas queries sobre o mesmo `where`, disparadas em paralelo com `Promise.all`. `count(*) over()` não é usado porque obriga a descartar a coluna de cada linha.
- Cast `as Pick<Linha, TCampo>[]` no fim do método é aceito: o drizzle não consegue provar a equivalência com `TCampo` genérico (ver [`12-problemas-conhecidos.md`](12-problemas-conhecidos.md), PC-007).
</regras>

<exemplo>
```ts
async listarPedidos<TCampo extends keyof Pedido = keyof Pedido>(
  campos?: readonly TCampo[],
  tx?: Executor,
): Promise<Pick<Pedido, TCampo>[]> {
  const linhas = await this.executor(tx)
    .select(selecionarColunas(pedidos, campos))
    .from(pedidos)
    .orderBy(pedidos.criadoEm);

return linhas as Pick<Pedido, TCampo>[];
}

async buscarIdsItensDoPedido(idPedido: string, tx?: Executor): Promise<string[]> {
const [linha] = await this.executor(tx)
.select({ ids: sql<string[]>`coalesce(array_agg(${itensPedido.id}), '{}')` })
.from(itensPedido)
.where(eq(itensPedido.idPedido, idPedido));

return linha?.ids ?? [];
}

````
</exemplo>

## Conexão

<regras>
- Tokens: `POOL_PG` (pool do `pg`) e `DRIZZLE` (client tipado). Implementação em [`06-injecao-dependencia.md`](06-injecao-dependencia.md).
- Pool configura `min`, `max`, `statement_timeout`, `query_timeout`, `idle_in_transaction_session_timeout`, `connectionTimeoutMillis`.
- Pool registra listener de `error`.
- Pool testa a conexão no boot (`connect()` + `release()`).
- Pool é encerrado em `onApplicationShutdown`.
- Produção: TLS com `rejectUnauthorized: true` e CA lida de arquivo configurado por variável de ambiente.
</regras>

## Transação

<exemplo>
```ts
// src/infrastructure/database/executor-transacao/executor-transacao.service.ts
@Injectable()
export class ExecutorTransacao {
  constructor(@Inject(DRIZZLE) private readonly db: BancoDeDados) {}

  executar<TResult>(trabalho: (tx: Transacao) => Promise<TResult>): Promise<TResult> {
    return this.db.transaction(trabalho);
  }
}
````

</exemplo>

Uso no service:

<exemplo>
```ts
const idPedido = await this.executorTransacao.executar(async (tx) => {
  const pedido = await this.pedidos.inserirPedido(dados, tx);
  await this.pedidos.inserirItens(itens, tx);
  return pedido.id;
});
```
</exemplo>

<regras>
- Somente o service abre transação, via `ExecutorTransacao`.
- Repositório nunca abre transação; recebe `tx?: Executor` e usa `tx ?? this.db`.
- Toda chamada de repositório dentro do callback recebe `tx`.
- Para abortar a transação: lançar exceção dentro do callback. Nunca usar `tx.rollback()`.
- Dentro do callback: apenas operações de banco. Sem chamada HTTP, publicação de evento ou invalidação de cache.
- Consistência entre banco e mensageria usa tabela outbox gravada na mesma transação.
</regras>

## Concorrência

<regras>
- Recurso editado por múltiplos atores usa as duas camadas juntas:
  1. Lock cooperativo: tabela de lock com TTL e índice único parcial por recurso ativo.
  2. Concorrência otimista: coluna `version`; `UPDATE ... WHERE id = :id AND version = :lida`. Zero linhas afetadas → `ConflictException`.
- `SELECT ... FOR UPDATE` não é usado para lock que dura enquanto o usuário edita.
</regras>

## Migrations

<exemplo>
```bash
pnpm run db:generate   # gera .sql a partir do schema
pnpm run db:migrate    # aplica migrations pendentes
pnpm run db:check      # detecta colisão entre migrations de branches paralelas
pnpm run db:studio     # inspeção local
pnpm run db:seed       # dados mínimos de desenvolvimento
```
</exemplo>

<regras>
- `db:push` é proibido.
- Fluxo: alterar `*.schema.ts` → `db:generate` → revisar o `.sql` → commitar `.schema.ts`, `.sql` e snapshot juntos.
- Arquivos em `drizzle/` não são editados à mão. Conflito de migration: apagar a migration local e gerar de novo.
- Migration é aditiva sempre que possível.
- Migration não roda no start da aplicação. Roda como passo isolado, com concorrência 1, antes do deploy.
</regras>
