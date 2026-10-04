import { execFileSync } from 'child_process';

declare global {
  // eslint-disable-next-line no-var
  var __TEST_DB_CONTAINER__: { stop(): Promise<unknown> } | undefined;
}

async function resolveDatabaseUrl(): Promise<string> {
  if (process.env.TEST_DATABASE_URL) {
    return process.env.TEST_DATABASE_URL;
  }

  try {
    const { PostgreSqlContainer } = await import('@testcontainers/postgresql');
    const container = await new PostgreSqlContainer('postgres:16-alpine')
      .withDatabase('split_ai_test')
      .start();

    globalThis.__TEST_DB_CONTAINER__ = container;

    return container.getConnectionUri();
  } catch (error) {
    throw new Error(
      'Nenhum banco de teste disponível. Defina TEST_DATABASE_URL (ex.: postgres://postgres@127.0.0.1:5432/split_ai_test) ou instale Docker + @testcontainers/postgresql.\n' +
        `Causa: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export default async function globalSetup(): Promise<void> {
  const url = await resolveDatabaseUrl();

  process.env.DATABASE_URL = url;
  process.env.TEST_DATABASE_URL = url;

  execFileSync('bun', ['run', 'test:db:prepare'], {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: url },
  });
}
