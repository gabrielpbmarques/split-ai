/**
 * Instantiates the whole Nest container — every module, provider, controller
 * and guard — with the TypeORM DataSource stubbed out, so the DI graph is
 * exercised for real without touching a database or opening a port.
 *
 *   bun run di:boot-check
 *
 * Must go through that package.json script (node + ts-node, module: commonjs).
 * Running this file directly under bun fails with
 * `SyntaxError: Export named 'FastifyReply' not found` — `emitDecoratorMetadata`
 * keeps the type-only `FastifyReply` import alive for `@Res() res: FastifyReply`,
 * and bun cannot resolve that named export from fastify's CJS build. tsc erases it.
 *
 * `Test.createTestingModule().compile()` creates every instance but does NOT
 * run lifecycle hooks (`onModuleInit`), so nothing connects to Postgres,
 * Supabase or the checkpointer. Any "Nest can't resolve dependencies" error
 * surfaces here exactly as it would at boot.
 */
import 'reflect-metadata';

import { Test } from '@nestjs/testing';
import { getDataSourceToken, getEntityManagerToken } from '@nestjs/typeorm';
import { AppModule } from 'src/app.module';

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

/** Answers any method with an empty result so construction-time calls survive. */
const fakeRepository: any = new Proxy(
  {},
  {
    get: (_target, prop) => {
      if (prop === 'then' || typeof prop === 'symbol') return undefined;
      if (prop === 'metadata') return { columns: [], relations: [] };
      if (prop === 'manager') return fakeDataSource;
      return () => Promise.resolve(undefined);
    },
  },
);

const fakeDataSource: any = {
  options: { type: 'postgres' },
  isInitialized: true,
  entityMetadatas: [] as unknown[],
  getRepository: () => fakeRepository,
  getMetadata: () => ({}),
  createQueryRunner: () => ({}),
  query: () => Promise.resolve([]),
  destroy: () => Promise.resolve(),
};

async function main(): Promise<void> {
  const started = process.hrtime.bigint();
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(getDataSourceToken())
    .useValue(fakeDataSource)
    .overrideProvider(getEntityManagerToken())
    .useValue({})
    .compile();

  const ms = Number(process.hrtime.bigint() - started) / 1e6;
  console.log('');
  console.log('DI boot-check');
  console.log('─'.repeat(72));
  console.log(`  ok — container compiled in ${ms.toFixed(0)}ms`);
  console.log('  every provider, controller and guard resolved');
  console.log('');
  await moduleRef.close();
}

main().catch((error) => {
  console.error('');
  console.error('DI boot-check FAILED');
  console.error('─'.repeat(72));
  console.error(error?.stack ?? error?.message ?? error);
  process.exit(1);
});
