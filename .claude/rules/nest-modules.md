---
paths:
  - 'src/**/*.module.ts'
  - 'src/**/*.port.ts'
  - 'src/modules/*/contracts/**'
---

# Nest modules and dependency injection

Owns: the three roles a `*.module.ts` can play, how each one is wired, and which injection mechanism to use.

## The three module roles

Every `*.module.ts` plays exactly one role.

| Role                        | Location                                                                            | `controllers`      | `providers`                           | How many                      |
| --------------------------- | ----------------------------------------------------------------------------------- | ------------------ | ------------------------------------- | ----------------------------- |
| Use case                    | `src/modules/<domain>/<use-case>/<use-case>.module.ts`                              | 1 (0 if auxiliary) | the use-case service                  | one per use case              |
| Domain aggregator           | `src/modules/<domain>/<domain>.module.ts`                                           | never              | never                                 | one per domain                |
| Repository / infrastructure | `src/modules/<domain>/repositories/*.repository.module.ts`, `src/infrastructure/**` | never              | the repository or the resource tokens | one per aggregate or resource |

### 1. Use-case module

<example>
```ts
import { Module } from '@nestjs/common';

import { TransactionExecutorModule } from 'src/infrastructure/database/transaction-executor/transaction-executor.module';
import { CreateAgentController } from 'src/modules/agents/create-agent/create-agent.controller';
import { CreateAgentService } from 'src/modules/agents/create-agent/create-agent.service';
import { AgentInstructionRepositoryModule } from 'src/modules/agents/repositories/agent-instruction.repository.module';
import { AgentRepositoryModule } from 'src/modules/agents/repositories/agent.repository.module';

@Module({
imports: [AgentRepositoryModule, AgentInstructionRepositoryModule, TransactionExecutorModule],
controllers: [CreateAgentController],
providers: [CreateAgentService],
exports: [CreateAgentService],
})
export class CreateAgentModule {}

````
</example>

<rules>
- Wiring only. `imports` is derived mechanically: one entry per thing the module's own classes inject, nothing more.
- Import only the repository modules the service uses. There is no repositories aggregator module.
- Import `TransactionExecutorModule` only if the service opens a transaction.
- Integration ports (`VECTOR_STORE`, `CHAT_MODEL`, `EMAIL`, …) need no import: the `@Global()` `IntegrationModule` publishes them.
- Always export the service.
- To use another use case's service, import that use case's module — never the aggregator that contains it.
</rules>

### 2. Domain aggregator

<example>
```ts
@Module({
  imports: [CreateAgentModule, ListAgentsModule, GetAgentModule],
  exports: [CreateAgentModule, ListAgentsModule, GetAgentModule],
})
export class AgentsModule {}
````

</example>

<rules>
- Only `imports` and `exports`, holding the same list of use-case modules.
- Never declares `controllers` or `providers`.
- It is the only module of the domain imported by `AppModule`.
- A new use case adds one entry to `imports` **and** `exports`. A module that compiles but is not chained never registers its route — no error, just a 404.
</rules>

### 3. Repository / infrastructure module

<example>
```ts
@Module({
  imports: [TypeOrmModule.forFeature([AgentEntity])],
  providers: [AgentRepository],
  exports: [AgentRepository],
})
export class AgentRepositoryModule {}
```
</example>

<rules>
- One repository module per aggregate: `TypeOrmModule.forFeature([XEntity])`, provides and exports a single repository class. `forFeature` is module-local — importing a module that registered an entity does not hand you its `Repository<T>`.
- A module that owns a resource with a lifecycle (pool, client) implements `OnApplicationShutdown` and releases it.
- Modules that publish ports to everyone are `@Global()`: `IntegrationModule` and `AgentRuntimeContractsModule` are the only ones. `AuthModule` registers the global guards.
</rules>

## Choosing an injection mechanism

| Mechanism                                           | When                                                                                           | Examples                                        |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Concrete class                                      | single implementation; default for services, repositories, `TransactionExecutor`               | `AgentRepository`, `CreateAgentService`         |
| `Symbol` + `useFactory`                             | infrastructure resource that needs construction (config, connection)                           | integration ports built by `select(live, mock)` |
| `Symbol` + interface + factory/`useExisting` (port) | implementation swaps by environment (mock vs. live), or another domain consumes the capability | `VECTOR_STORE`, `CHAT_MODEL`, `AGENT_RESOLVER`  |

<checklist>
Decide in order:

1. Database repository → concrete class.
2. Infrastructure resource with non-trivial construction → `Symbol` + `useFactory`.
3. Implementation swaps by environment, or another domain consumes the capability → port.
4. Anything else → concrete class.
   </checklist>

## Concrete class

<rules>
- Constructor injection only, with `private readonly`.
- The injected class uses a value import, never `import type` (see `conventions.md`, Typing).
- Every `@Injectable()` is listed in some module's `providers`.
- To inject a provider from another module, import the module that exports it.
- No module cycles and no `forwardRef`.
</rules>

## Ports

<example>
```ts
// src/infrastructure/integration/vector-store.port.ts
export const VECTOR_STORE = Symbol('VECTOR_STORE');

export interface VectorStoreGateway extends IntegrationGateway {
upsertChunks(chunks: readonly Document[], metadata: Record<string, unknown>): Promise<void>;
deleteBySourceId(sourceId: string): Promise<void>;
}

````

```ts
// consumer
constructor(@Inject(VECTOR_STORE) private readonly vectorStore: VectorStoreGateway) {}
````

</example>

<rules>
- Token and interface live in the same `*.port.ts` file; tokens are always `Symbol`, never strings.
- Infrastructure port: `src/infrastructure/integration/<name>.port.ts`. Domain port consumed by another domain: `src/modules/<domain>/contracts/<name>.port.ts`.
- The module exports the token, not the concrete class.
- The interface contains only the methods consumers use.
- Consumers inject by token and type by interface.
- Do not create a port without a consumer or without a second real implementation.
- `useExisting` does not break a Nest instantiation cycle. `AGENT_RESOLVER` therefore uses a lazy `ModuleRef.get(..., { strict: false })` factory (PC-008); copy that pattern for the next cycle.
</rules>

## After changing wiring

Run `bun run di:verify` (static reachability of every injection, understands `@Global()`, flags controllers unreachable from `AppModule`) and `bun run di:boot-check` (compiles the real Nest container with the `DataSource` stubbed — the same errors Nest raises at boot, without a database).
