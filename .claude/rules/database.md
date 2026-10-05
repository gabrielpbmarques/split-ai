---
paths:
  - 'src/infrastructure/database/**'
  - 'src/modules/**/repositories/**'
  - 'scripts/test/prepare-database.ts'
---

# Database: entities, repositories, transactions, migrations

Owns: where tables are declared, lifecycle columns and soft delete, projection and listing, transactions, concurrency and migrations. The ORM is **TypeORM 0.3** on PostgreSQL (Supabase), a conscious deviation from the rule set's Drizzle (see `CLAUDE.md`).

## Layout

<structure>
```
src/infrastructure/database/
  database.types.ts          Executor = EntityManager
  data-source.ts             DataSource for the TypeORM CLI (ts-node/CommonJS, PC-006)
  utc-timestamps.ts          timestamp columns read/written as UTC regardless of host timezone
  transaction-executor/      TransactionExecutor + TransactionExecutorModule
  migrations/                <timestamp>-<name>.ts + index.ts exporting MIGRATIONS
  schema/                    <name>.entity.ts + index.ts exporting every entity and ENTITIES
```
</structure>

## Entities

<rules>
- Every table is declared in `src/infrastructure/database/schema/`. A domain module never declares a table.
- One file per table, `<name>.entity.ts`, exported by the barrel **and** added to `ENTITIES`.
- Schema files may import each other relatively (the only exception to absolute imports); the barrel `index.ts` does.
- Table and column names are snake_case and explicit (`@Entity('agent_connections')`, `@JoinColumn({ name: 'agent_id' })`).
- PK: `@PrimaryGeneratedColumn('uuid')`.
- Foreign keys declare `onDelete` explicitly when the relation is not a plain lookup.
- `jsonb` columns are typed (`Record<string, unknown>` or a specific interface) and nullable unless a default exists.
- Index names: `<table>_<purpose>_idx`; unique: `<table>_<purpose>_uq`; check: `<table>_<rule>`.
- A data invariant (date ordering, conditionally required column) is also a `@Check` in the database.
- The `documents` table, `match_documents` and the pgvector index live only in Supabase and are changed by hand in its SQL editor; TypeORM never touches them.
- The LangGraph `PostgresSaver` tables (`checkpoints`, `checkpoint_blobs`, `checkpoint_writes`, `checkpoint_migrations`) live in the same database and are owned by the library; do not declare entities for them.
</rules>

## Lifecycle columns and soft delete

<critical_rule>
Every entity declares `created_at` (`@CreateDateColumn`), `updated_at` (`@UpdateDateColumn`) and `deleted_at` (`@DeleteDateColumn`, nullable). Physical `DELETE` is not used: deleting means `softDelete`, which fills `deleted_at`. Physical deletion destroys the history other rows reference and fails on restrictive foreign keys.
</critical_rule>

<rules>
- Services never assign `created_at`, `updated_at` or `deleted_at`.
- TypeORM's `find*` methods filter `deleted_at IS NULL` automatically; raw `createQueryBuilder().from('table')` subqueries and raw SQL must filter it themselves, on both sides of a join.
- Every unique index is partial: `where: '"deleted_at" IS NULL'`.
- Deletion does not cascade by default.
- `deleted_at` is not business state. State uses its own column (`status`, `revoked_at`, `expired`).
</rules>

## Repositories

<example>
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
</example>

<rules>
- One concrete `@Injectable()` class per aggregate, no interface, no base class, no generic repository.
- Location: `src/modules/<domain>/repositories/<name>.repository.ts` with `<name>.repository.module.ts` beside it. Import it from its own file; there is no barrel.
- Inject with `@InjectRepository(XEntity) private readonly repository: Repository<XEntity>`.
- Every write method takes `tx?: Executor` as its **last** parameter and runs on `tx.getRepository(...)` when given.
- Never opens a transaction.
- Return types derive from the entity (`XEntity`, `Pick<XEntity, K>`). Filters and composed results are interfaces exported from the repository file.
- `update()` payloads are cast `data as QueryDeepPartialEntity<XEntity>` (PC-015).
- A read may join another domain's table; writes only touch the domain's own tables (`conventions.md`).
</rules>

## Projection and listing

<critical_rule>
The shape of a listing payload is decided in the `select`, never by iterating the result in memory. Walking thousands of rows to "normalize" fields costs CPU and memory the database already solves for free in the projection.
</critical_rule>

<rules>
- A listing method takes `fields?: readonly K[]` after its filters and before `tx`, and returns `Pick<XEntity, K>[]` (or `PageResult<Pick<XEntity, K>>`). Without `fields` it returns every column.
- The service declares the exposed fields in a constant `as const satisfies readonly (keyof Model)[]` and returns the repository's list untouched.
- A column that must not leave is kept out of the `select`; a row that must not leave is kept out by the `where`. Computed fields (counts, aggregates, aliases) are expressions in a `createQueryBuilder().select(...)`, not post-processing.
- A list of related ids comes out of the database already aggregated (`array_agg`) in a dedicated method; do not fetch whole rows to extract the id.
- Pagination: page and total come from `findAndCount`, or from two queries over the same `where` fired in parallel with `Promise.all`.
</rules>

## Transactions

<example>
```ts
const agent = await this.transactionExecutor.run(async (tx) => {
  const created = await this.agentRepository.create(data, tx);
  await this.agentInstructionRepository.create({ agent_id: created.id, instructions }, tx);
  return created;
});
````

</example>

<rules>
- Only services open transactions, through `TransactionExecutor.run(async (tx) => …)` (`tx` is a TypeORM `EntityManager`).
- Every repository call inside the callback receives `tx`.
- To abort, throw inside the callback.
- Inside the callback: database operations only. No HTTP, no vector-store writes, no e-mail.
- Used today by `CreateAgent` and `UpdateAgent`.
</rules>

## Concurrency

<rules>
- A resource edited by several actors uses optimistic concurrency: a `version` column and `UPDATE … WHERE id = :id AND version = :read`; zero affected rows → `ConflictException`.
- `SELECT … FOR UPDATE` is not used for locks that last while a person edits.
</rules>

## Migrations

<rules>
- `synchronize` is off everywhere except the e2e harness, which synchronizes the schema from the entities and marks the migrations applied (PC-017).
- Flow: change the entity → `bun run db:generate src/infrastructure/database/migrations/<timestamp>-<name>` against a database that mirrors production (PC-011) → review the SQL → register the class in `migrations/index.ts` → commit entity and migration together. `bun run db:check` fails when they diverge.
- Prefer additive migrations. A destructive one (drop table/column) first copies whatever data must survive inside the same migration, its `down()` restores what it can (columns on surviving tables), and the PR says plainly that dropped data needs a backup to come back. `1759700000000-remove-multi-tenancy.ts` is the reference.
- `CREATE INDEX CONCURRENTLY` on big tables needs `transaction = false` on the migration class (PC-010).
- Migrations never run at boot. The CI `migrate` job runs `bun run db:migrate` with concurrency 1 on pushes to `main`. Railway deploys independently, so a new release can start before the migration finishes; `/health/startup` answers 503 while one is pending. Keep migrations backward compatible with the previous release whenever possible.
- There is no baseline migration: the migrations are deltas over the production schema (PC-017).
</rules>
