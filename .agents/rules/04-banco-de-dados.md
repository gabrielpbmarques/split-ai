---
trigger: glob
description: 'Banco de dados (TypeORM 0.3 / PostgreSQL): entidades em schema/, soft delete, timestamps UTC, repositórios, projeção/listagem, transações, concorrência e migrations.'
globs: 'src/infrastructure/database/**, src/**/repositories/**'
---

# Banco de dados: entidades, repositórios, transações e migrations

Cobre: onde as tabelas são declaradas, colunas de ciclo de vida e soft delete, timestamps em UTC, projeção e listagem, transações, concorrência e migrations. O ORM é o **TypeORM 0.3** sobre PostgreSQL (Supabase), um desvio consciente em relação ao Drizzle da especificação base (`00-projeto.md`).

## Estrutura

<estrutura>
```
src/infrastructure/database/
  database.types.ts          Executor = EntityManager
  data-source.ts             DataSource para o CLI do TypeORM (ts-node/CommonJS, PC-006)
  utc-timestamps.ts          Colunas timestamp lidas e gravadas como UTC independente do fuso da máquina
  transaction-executor/      TransactionExecutor + TransactionExecutorModule
  migrations/                <timestamp>-<name>.ts + index.ts exportando MIGRATIONS
  schema/                    <name>.entity.ts + index.ts exportando cada entidade e ENTITIES
```
</estrutura>

## Entidades (`schema/`)

As 9 entidades gerenciadas pelo TypeORM hoje em `ENTITIES` são: `SessionEntity`, `MessageEntity`, `AgentEntity`, `AgentConnectionEntity`, `UserEntity`, `UserTokenEntity`, `NotificationEntity`, `ReportEntity` e `SourceEntity`.

<regras>
- Toda tabela gerenciada pela aplicação é declarada em `src/infrastructure/database/schema/`. Um módulo de domínio nunca declara entidade/tabela.
- Um arquivo por tabela, `<name>.entity.ts`, exportado pelo barril `schema/index.ts` **e** adicionado ao array `ENTITIES`.
- Arquivos dentro de `schema/` podem importar uns aos outros com caminho relativo (`./`) — a única exceção aos imports absolutos `src/*`.
- Nomes de tabelas e colunas são explícitos e em `snake_case` em inglês (`@Entity('agent_connections')`, `@JoinColumn({ name: 'agent_id' })`).
- Chave primária: `@PrimaryGeneratedColumn('uuid')`.
- Chaves estrangeiras declaram `onDelete` explicitamente quando a relação não for apenas uma consulta simples.
- Colunas `jsonb` são tipadas (`Record<string, unknown>` ou uma interface específica) e `nullable` a menos que exista um valor default.
- Nomes de índices: `<table>_<purpose>_idx`; únicos: `<table>_<purpose>_uq`; checks: `<table>_<rule>`.
- Uma invariante de dados (ordenação de datas, coluna condicionalmente obrigatória) também deve ser declarada como `@Check` no banco.
- A tabela `documents`, a função `match_documents` e o índice `pgvector` vivem exclusivamente no Supabase e são alterados manualmente no editor SQL do Supabase; o TypeORM nunca toca neles (`09-ferramentas-e-rag.md`).
- As tabelas do Deep Agents / LangGraph (`store`, `store_migrations`, `checkpoints*`) vivem no mesmo banco e pertencem às respectivas bibliotecas (`@langchain/langgraph-checkpoint-postgres`); não declare entidades TypeORM para elas (ver `08-agentes-de-ia.md` e PC-019).
</regras>

## Colunas de ciclo de vida, soft delete e UTC

<regra critica="true">
Toda entidade declara `created_at` (`@CreateDateColumn`), `updated_at` (`@UpdateDateColumn`) e `deleted_at` (`@DeleteDateColumn`, nullable). `DELETE` físico não é utilizado em entidades do domínio: excluir significa `softDelete`, que preenche `deleted_at`. A exclusão física destrói o histórico referenciado por outras linhas e falha em chaves estrangeiras restritivas.
</regra>

<regras>
- Services nunca atribuem manualmente `created_at`, `updated_at` ou `deleted_at`.
- Os métodos `find*` do TypeORM filtram `deleted_at IS NULL` automaticamente; subqueries cruas com `createQueryBuilder().from('table')` e SQL puro devem filtrar `deleted_at IS NULL` explicitamente em ambos os lados de um `JOIN`.
- Todo índice único é parcial: `where: '"deleted_at" IS NULL'`.
- A exclusão não faz cascade por padrão.
- `deleted_at` não é estado de negócio. Estados de negócio usam coluna própria (`status`, `expired`, `revoked_at`).
- **Colunas `timestamp` guardam UTC (`utc-timestamps.ts`):** toda coluna de data do schema é `timestamp without time zone`, com defaults `now()` gravados em UTC pelo Postgres. `useUtcForTimestampColumns()` configura o driver `pg` para enviar parâmetros `Date` e ler essas colunas como UTC independentemente do fuso horário do processo Node (evitando deriva de horas em filtros `BETWEEN` em máquinas locais fora de UTC). É chamado tanto em `AppModule` quanto em `data-source.ts`.
</regras>

## Repositórios

<exemplo>
```ts
@Injectable()
export class SourceRepository {
  constructor(
    @InjectRepository(SourceEntity)
    private readonly repository: Repository<SourceEntity>,
  ) {}

async listByAgentPaginated<K extends keyof SourceEntity>(
agentId: string,
page: PageRequest,
fields?: readonly K[],
tx?: Executor,
): Promise<PageResult<Pick<SourceEntity, K>>> {
const [items, total] = await this.repo(tx).findAndCount({
where: { agent_id: agentId },
select: fields ? [...fields] : undefined,
order: { created_at: 'DESC' },
skip: skipOf(page),
take: page.limit,
});

    return { items, total };

}

create(data: Partial<SourceEntity>, tx?: Executor): Promise<SourceEntity> {
return this.repo(tx).save(this.repo(tx).create(data));
}

async softDelete(id: string, tx?: Executor): Promise<void> {
await this.repo(tx).softDelete(id);
}

private repo(tx?: Executor): Repository<SourceEntity> {
return tx ? tx.getRepository(SourceEntity) : this.repository;
}
}

````
</exemplo>

<regras>
- Uma classe concreta `@Injectable()` por agregado, sem interface, sem classe base e sem repositório genérico.
- Localização: `src/modules/<domain>/repositories/<name>.repository.ts` com `<name>.repository.module.ts` ao lado. Importe o repositório diretamente de seu arquivo; não há barril (`index.ts`).
- Injete com `@InjectRepository(XEntity) private readonly repository: Repository<XEntity>`.
- Todo método de escrita recebe `tx?: Executor` como seu **último** parâmetro e executa sobre `tx.getRepository(...)` quando fornecido (via helper privado `this.repo(tx)`).
- Um repositório nunca abre transação.
- Tipos de retorno derivam da entidade (`XEntity`, `Pick<XEntity, K>`). Filtros e resultados compostos são interfaces exportadas pelo próprio arquivo do repositório.
- Payloads de `update()` usam o cast intencional `data as QueryDeepPartialEntity<XEntity>` (PC-015).
- Uma leitura pode fazer join com tabela de outro domínio; escritas tocam apenas as tabelas do próprio domínio (`01-topologia-e-convencoes.md`).
</regras>

## Projeção e listagem

<regra critica="true">
O formato do payload de uma listagem é decidido no `select` da query, nunca iterando o resultado em memória no service. Percorrer milhares de linhas em JavaScript para "normalizar" ou esconder campos gasta CPU e memória que o banco de dados resolve de graça na projeção.
</regra>

<regras>
- Um método de listagem recebe `fields?: readonly K[]` após seus filtros e antes de `tx?`, retornando `Pick<XEntity, K>[]` (ou `PageResult<Pick<XEntity, K>>`). Sem `fields`, retorna todas as colunas.
- O service declara os campos expostos em uma constante `as const satisfies readonly (keyof Model)[]` e retorna a lista do repositório sem reprocessá-la.
- Uma coluna que não deve sair na resposta fica de fora do `select`; uma linha que não deve sair fica de fora pelo `where`. Campos calculados (contagens, agregações, aliases) são expressões em `createQueryBuilder().select(...)`, não pós-processamento em memória.
- Uma lista de IDs relacionados já sai agregada do banco (`array_agg`) em um método dedicado; não busque linhas inteiras apenas para extrair o `id`.
- Paginação: página e total vêm de `findAndCount`, ou de duas queries sobre o mesmo `where` disparadas em paralelo com `Promise.all`.
</regras>

## Transações

<exemplo>
```ts
const result = await this.transactionExecutor.run(async (tx) => {
  const item = await this.itemRepository.create(data, tx);
  await this.otherRepository.create({ item_id: item.id }, tx);
  return item;
});
````

</exemplo>

<regras>
- Apenas services abrem transações, por meio de `TransactionExecutor.run(async (tx) => …)` (`tx` é um `EntityManager` do TypeORM).
- Toda chamada de repositório dentro do callback recebe `tx`.
- Para abortar e fazer rollback, lance uma exceção dentro do callback.
- Dentro do callback: apenas operações de banco de dados. Proibido fazer chamadas HTTP, escritas na vector store ou envio de mensagens.
- Use sempre que escrever em mais de uma tabela ou quando atomicidade for necessária. (Se um caso de uso escreve em apenas uma tabela, como `CreateAgentService` após a remoção de `agents_instructions`, não abra transação desnecessária).
</regras>

## Concorrência

<regras>
- Um recurso editado concorrentemente por múltiplos atores usa concorrência otimista: coluna `version` e `UPDATE … WHERE id = :id AND version = :read`; zero linhas afetadas → `ConflictException`.
- `SELECT … FOR UPDATE` não é usado para travas que duram enquanto uma pessoa edita na tela.
</regras>

## Migrations

<regras>
- `synchronize` fica desligado em todos os ambientes, exceto no harness de testes e2e, que sincroniza o schema a partir das entidades e marca as migrations como aplicadas (PC-017).
- Fluxo para alterar schema:
  1. Altere a entidade em `src/infrastructure/database/schema/<name>.entity.ts`.
  2. Gere a migration com `bun run db:generate src/infrastructure/database/migrations/<timestamp>-<name>` contra um banco local que espelhe o schema de produção (PC-011; nunca aponte `db:generate` para produção).
  3. Revise o SQL gerado.
  4. Registre a classe da migration em `src/infrastructure/database/migrations/index.ts` (`MIGRATIONS`).
  5. Faça commit da entidade e da migration juntas. `bun run db:check` falha quando elas divergem.
- Prefira migrations aditivas. Uma migration destrutiva (drop table/column) primeiro copia os dados que precisam sobreviver dentro da mesma migration, seu `down()` restaura o que for possível nas tabelas sobreviventes, e o PR informa claramente que dados removidos dependem de backup para reversão completa (`1759700000000-remove-multi-tenancy.ts` e `1759900000000-unify-agent-system-prompt-remove-database.ts` são as referências).
- `CREATE INDEX CONCURRENTLY` em tabelas grandes exige `transaction = false` na classe da migration e comandos idempotentes (`IF NOT EXISTS` / `IF EXISTS`), o que funciona porque `data-source.ts` define `migrationsTransactionMode: 'each'` (PC-010).
- Consultas ao catálogo do Postgres em uma migration (`pg_class`, `pg_index`, `information_schema`) devem resolver a tabela via `'<table>'::regclass` ou filtrar explicitamente `table_schema = 'public'`: o schema `auth` do Supabase também possui tabelas `users` e `sessions`, e uma busca solta por `relname` as atinge.
- Migrations nunca rodam no boot da aplicação. O job `migrate` na CI executa `bun run db:migrate` com concorrência 1 em pushes na `main`. Como o Railway faz deploy de forma independente, uma versão nova pode subir segundos antes de a migration terminar; `/health/startup` responde `503` enquanto houver migration pendente. Mantenha migrations retrocompatíveis com a release anterior sempre que possível.
- Não existe migration baseline: as migrations são deltas sobre o schema histórico de produção (PC-017).
</regras>
