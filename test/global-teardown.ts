export default async function globalTeardown(): Promise<void> {
  await globalThis.__TEST_DB_CONTAINER__?.stop();
}
