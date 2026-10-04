---
name: architecture
description: 'Use when scaffolding modules, use cases, controllers, services, DTOs, entities, repositories or integration gateways, or for questions about the src/ layout, module imports/exports and DI. This is the split-ai delta over rules 01, 03, 04 and 06 of ai-agents-engineering; the rules themselves are the spec.'
---

The layout, the module discipline and the DI rules are the rules `01-topologia.md`, `03-modulo-nest.md`, `04-anatomia-caso-de-uso.md` and `06-injecao-dependencia.md` in `ai-agents-engineering/docs/backend/rules/`. This skill only maps them onto this repository's names and paths. The always-on `CLAUDE.md` has the tree and the deviations; don't restate them here.

## Where things go

| Thing | Path | Module that exports it |
| --- | --- | --- |
| Use case (endpoint or auxiliary) | `src/modules/<domain>/<verb-noun>/<verb-noun>.{module,controller,service,dto}.ts` | its own `<VerbNoun>Module` |
| Domain aggregator | `src/modules/<domain>/<domain>.module.ts` (`imports` = `exports` = use-case modules; nothing else) | imported only by `AppModule` |
| Repository | `src/modules/<domain>/repositories/<name>.repository.ts` + `<name>.repository.module.ts` | `<Name>RepositoryModule` (`TypeOrmModule.forFeature([XEntity])`, module-local) |
| Entity | `src/infrastructure/database/schema/<name>.entity.ts`, barrel + `ENTITIES` in `index.ts` | `TypeOrmModule.forRoot` in `AppModule` |
| Migration | `src/infrastructure/database/migrations/<timestamp>-<name>.ts`, registered in `MIGRATIONS` | CI `migrate` job |
| Transaction | `TransactionExecutor` | `TransactionExecutorModule` |
| Ownership check | `AccessScopeService.ensureCan` | `AuthModule` |
| Cross-domain port | `src/modules/<domain>/contracts/<name>.port.ts` | a `@Global()` contracts module (`AgentRuntimeContractsModule`) |
| Integration port | `src/infrastructure/integration/<name>.port.ts` | `@Global()` `IntegrationModule` — **no import needed** |
| Integration adapter | `src/infrastructure/integration/<source>/{<source>.contracts.ts, <source>.mappers.ts, <source>-<port>.gateway.ts}` + `mock/mock-<port>.gateway.ts` | registered in `integration.module.ts` with `select<Port>(live, mock)` |
| Shared type | `src/shared/contracts/models/<name>.model.ts`, barrel `src/shared/contracts` | — |
| Pure helper | `src/shared/utils/<name>.ts` (one function per file) | — |

## Use-case module recipe

`imports` is derived mechanically: one entry per thing the module's own classes inject, nothing else.

```typescript
@Module({
  imports: [
    AgentRepositoryModule,
    AgentInstructionRepositoryModule,
    TransactionExecutorModule,
    AuthModule,
  ],
  controllers: [CreateAgentController],
  providers: [CreateAgentService],
  exports: [CreateAgentService],
})
export class CreateAgentModule {}
```

- Register the module in both `imports` and `exports` of `src/modules/<domain>/<domain>.module.ts`, or the route never mounts (no error).
- A sibling or cross-domain service → import **that use case's module**, never the aggregator.
- A cycle → a port in `contracts/` (see `AGENT_RESOLVER`, PC-008), never `forwardRef`.
- Then run `bun run di:verify` (static reachability, understands `@Global()`) and `bun run di:boot-check` (compiles the real Nest container with the `DataSource` stubbed).

## Repository recipe

Concrete class, named methods only, `tx?: Executor` last on writes, `softDelete` never `delete`:

```typescript
@Injectable()
export class SourceRepository {
  constructor(
    @InjectRepository(SourceEntity)
    private readonly repository: Repository<SourceEntity>,
  ) {}

  private repo(tx?: Executor): Repository<SourceEntity> {
    return tx ? tx.getRepository(SourceEntity) : this.repository;
  }

  async listByAgentPaginated<K extends keyof SourceEntity>(
    agentId: string,
    page: PageRequest,
    fields?: readonly K[],
  ): Promise<PageResult<Pick<SourceEntity, K>>> {
    const [items, total] = await this.repository.findAndCount({
      where: { agent_id: agentId },
      select: fields ? [...fields] : undefined,
      skip: skipOf(page),
      take: page.limit,
      order: { created_at: 'DESC' },
    });
    return { items, total };
  }

  create(data: Partial<SourceEntity>, tx?: Executor): Promise<SourceEntity> {
    return this.repo(tx).save(this.repo(tx).create(data));
  }
}
```

`update()` payloads need `data as QueryDeepPartialEntity<Entity>` (PC-015).

## Tools for agents

LangChain tools follow the same one-use-case-one-module shape under `src/modules/retrieval/`: `load-vector-search-tool/` and `load-database-tool/` are the templates. A tool service exposes one `execute(...)` returning an `AgentTool` (`StructuredToolInterface`, from `src/shared/contracts`). `LoadAgentToolsService` assembles the tool belt from the agent flags (`parser_schema`, `vector_search_tool`, `database_tool`) and the enabled `agent_connections`; `MaybeLoadDatabaseToolService` gates `execute_sql` on the organization feature + `database_url`. Details: `ai-agent-tools-and-rag`, `.claude/rules/agent-tools.md`.

## Integration gateway recipe

```typescript
export const EMAIL = Symbol('EMAIL');

export interface EmailGateway extends IntegrationGateway {
  send(message: EmailMessage): Promise<void>;
}

export class SendGridEmailGateway implements EmailGateway {
  readonly name = 'sendgrid';
  private readonly configured = Boolean(env.SENDGRID_API_KEY);

  state(): IntegrationState {
    return this.configured ? 'READY' : 'NOT_CONFIGURED';
  }

  async send(message: EmailMessage): Promise<void> {
    if (!this.configured) notConfigured(this.name);
    await SendGrid.send(toSendGridMail(message));
  }
}
```

Consumption: `constructor(@Inject(EMAIL) private readonly email: EmailGateway) {}` — no module import. The interface holds only what consumers use; a missing credential is `NOT_CONFIGURED` + 503 on call, never a boot failure; hand-written HTTP goes through `ResilientClient`; external payloads are validated with Zod in `<source>.contracts.ts` and mapped by pure functions in `<source>.mappers.ts` (with a spec) before they reach `src/modules/`. Every port has a mock in `integration/mock/`.

## Auth surface

Two global guards (`AuthenticationGuard` → `AuthorizationGuard`), no `@UseGuards` except `ThrottlerGuard` on SMS. Every handler carries `@Public()` or `@RequirePermissions('<resource>.<action>')` (typed keys from `src/auth/permissions.ts`), chat/conversation routes add `@RequireActiveOrganization()`, and resource ownership is `accessScope.ensureCan(user, permission, { organizationId }, message)` inside the service. Nullable `user.id` / `user.organization_id` go through `requireUserId` / `requireOrganizationId`.
