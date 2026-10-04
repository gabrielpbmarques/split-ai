import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { MIGRATIONS } from 'src/infrastructure/database/migrations';
import { ENTITIES } from 'src/infrastructure/database/schema';

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error('DATABASE_URL é obrigatória para preparar o banco de teste');
}

async function main(): Promise<void> {
  const dataSource = new DataSource({
    type: 'postgres',
    url,
    entities: ENTITIES,
    migrations: MIGRATIONS,
    synchronize: true,
    dropSchema: true,
    migrationsTableName: 'migrations',
  });

  await dataSource.initialize();

  const runner = dataSource.createQueryRunner();

  try {
    await runner.query(
      `CREATE TABLE IF NOT EXISTS "migrations" ("id" SERIAL PRIMARY KEY, "timestamp" bigint NOT NULL, "name" character varying NOT NULL)`,
    );

    for (const migration of MIGRATIONS) {
      const instance = new migration();
      const name = instance.name ?? migration.name;
      const timestamp = Number(name.match(/\d+$/)?.[0] ?? Date.now());

      await runner.query(
        `INSERT INTO "migrations" ("timestamp", "name") VALUES ($1, $2)`,
        [timestamp, name],
      );
    }
  } finally {
    await runner.release();
    await dataSource.destroy();
  }

  process.stdout.write(
    `test database ready: ${ENTITIES.length} tables synchronized, ${MIGRATIONS.length} migrations marked as applied\n`,
  );
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  process.exit(1);
});
