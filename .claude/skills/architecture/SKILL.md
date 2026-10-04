---
name: architecture
description: 'Use when scaffolding modules, use cases, controllers, services, DTOs, entities, repositories, or providers, or for questions about project structure, the scope→use-case layout, module imports/exports, and DI patterns. Pairs with the always-on Hard rules in CLAUDE.md.'
---

## Project Root Structure

```text
src/
  app.module.ts          # Root module — imports TypeOrmModule.forRoot, ComponentsModule, HealthModule
  main.ts                # Bootstrap — createFastifyAdapter() + global createValidationPipe() + nestjs-pino. No global "api" prefix; routes mount at each @Controller(...) path. See CLAUDE.md "Things that bite".
  shared/config/env.ts   # Zod-validated frozen env object (only place that reads process.env)
  auth/                  # Guards (e.g., AuthGuard, RoleGuard, DomainSpecificGuards)
  components/            # Feature modules organized by scope
  decorators/            # Custom decorators (@Roles, @User)
  entities/              # TypeORM entities — barrel exported via index.ts
  infrastructure/        # External service providers
  repositories/          # TypeORM repository wrappers — barrel exported via index.ts
  types/                 # Type definitions — models/ sub-directory, barrel exported via index.ts
  utils/                 # Pure utility functions to reduce code duplication
```

## Module Hierarchy

```text
AppModule
├── TypeOrmModule.forRoot(...)
├── ScheduleModule.forRoot()
├── ComponentsModule            # All feature modules
└── HealthModule
```

There is **no** catch-all `InfrastructureModule` / `RepositoriesModule`. Each
repository and each external provider owns a small module of its own, and a use
case imports only the ones it actually injects.

### ComponentsModule

`components/components.module.ts` imports all scope-level modules (wiring only — no `exports`):

```text
ComponentsModule
├── AuthModule
├── UserModule
├── ProductModule
├── OrderModule
├── NotificationModule
└── PaymentModule
```

Each scope module (e.g., `OrderModule`) imports its use case modules. It exists so their controllers register; it declares no `providers`, no `controllers` and **no `exports`**.

## Component Pattern (Scope → Use Cases)

Each directory inside `components/` represents a **scope** (domain area). Inside each scope, sub-directories represent **use cases**.

### Directory naming

- Scope directories: **PascalCase** (e.g., `Order/`, `Auth/`, `Notification/`)
- Use case directories: **PascalCase** (e.g., `CreateOrder/`, `Login/`, `GenerateToken/`)
- Files inside use cases: **kebab-case** (e.g., `create-order.service.ts`, `login.dto.ts`)

### Use case that exposes an endpoint

```text
components/
  <Scope>/
    <scope>.module.ts                       # Scope module
    <UseCase>/
      <use-case>.module.ts                  # Use case module
      <use-case>.controller.ts              # REST controller
      <use-case>.service.ts                 # Business logic
      <use-case>.dto.ts                     # class-validator DTO
      <use-case>.service.spec.ts            # Unit tests (optional)
```

### Use case that is auxiliary (no endpoint)

Some use cases exist only to be consumed by other use cases. They have no controller or DTO.

```text
components/
  <Scope>/
    <UseCase>/
      <use-case>.module.ts
      <use-case>.service.ts
```

Example: `GenerateToken` is an auxiliary use case used by `Login`. The `GenerateTokenModule` is imported inside `LoginModule`.

### Scope module pattern

The scope module is **wiring only** — it imports its use case modules so their
controllers register, and exports nothing:

```typescript
@Module({
  imports: [
    CreateOrderModule,
    ListOrdersModule,
    GetOrderModule,
    // ... all use case modules
  ],
})
export class OrderModule {}
```

Never add an `exports` array here. A module that wants `CreateOrderService`
imports `CreateOrderModule` directly — importing `OrderModule` to reach one
service drags in the whole scope.

### Use case module pattern

Its `imports` array is derived mechanically: list the module that supplies each
thing the module's own classes inject, and nothing else.

```typescript
@Module({
  imports: [
    OrderRepositoryModule, // CreateOrderService injects OrderRepository
    StripeProviderModule, // ... and @Inject(STRIPE_CLIENT)
    GenerateTokenModule, // ... and GenerateTokenService
  ],
  controllers: [CreateOrderController], // Only if this use case is an endpoint
  providers: [CreateOrderService],
  exports: [CreateOrderService], // Export the service for other modules
})
export class CreateOrderModule {}
```

**Key rules:**

- One repository → its `XRepositoryModule` (`src/repositories/<name>.repository.module.ts`).
- One infrastructure token → its `XProviderModule` (`src/infrastructure/providers/<name>.provider.module.ts`).
- One sibling/cross-scope service → that use case's own module (e.g. `GenerateTokenModule`), **never** the scope aggregator.
- The `imports` must also cover what the module's `@UseGuards(...)` enhancers inject — `CompositeAuthGuard` pulls in `ApiKeyGuard`, which needs `ApiKeyRepositoryModule` + `OrganizationRepositoryModule`.
- Mutual dependencies use `forwardRef(() => XModule)` on **both** sides, matching `@Inject(forwardRef(() => XService))` in the constructor.
- Cross-scope dependencies are allowed: use case modules can import modules from other scopes.
- Check your work with `bun run di:verify` (static reachability) and `bun run di:boot-check` (real Nest container, DataSource stubbed).

## Repositories

All repositories live in `src/repositories/`. Each wraps a TypeORM `Repository<Entity>`.

### Repository pattern

```typescript
@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async findById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findOneBy({ id });
  }
  // ... domain-specific query methods
}
```

### Repository modules

Every repository has a sibling module next to it:

```text
src/repositories/
  order.repository.ts
  order.repository.module.ts   -> OrderRepositoryModule
```

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity])],
  providers: [OrderRepository],
  exports: [OrderRepository],
})
export class OrderRepositoryModule {}
```

`TypeOrmModule.forFeature` is **module-local**: the `Repository<OrderEntity>`
token only exists inside the module that registered it, so each repository
module registers its own entity. If the repository injects anything else (e.g.
`MessageRepository` injects `VOYAGE_EMBEDDINGS`), add that provider module to
this module's `imports` too. A repository backed by `DataSource` alone
(`UniversalDataRepository`) needs no `forFeature` at all.

## Tools scope

LangChain tools available to AI agents follow the same one-use-case-one-module pattern as everything else, but live under a dedicated top-level scope at `src/components/Tools/`. Each tool gets its own directory with a single service and a single module — never bundle multiple tools into one service.

### Directory layout

```text
components/
  Tools/
    tools.module.ts                              # Scope module — imports/exports every tool module
    <ToolName>/
      <tool-name>-tool.module.ts                 # Tool's NestJS module
      <tool-name>-tool.service.ts                # Exposes execute(ctx): DynamicStructuredTool<...>
```

### Tool service pattern

The service is `@Injectable()`, takes any dependencies via constructor (repositories from their `XRepositoryModule`, external clients from their `XProviderModule`, sibling services), and exposes a single `execute(...)` method that returns (or resolves to) a `DynamicStructuredTool`. Its argument carries whatever per-request input the tool needs — e.g. `LoadDatabaseTool.execute({ databaseUrl, readOnly, scope })`, while `LoadVectorSearchTool.execute()` takes none.

```typescript
@Injectable()
export class LoadDatabaseToolService {
  // No constructor deps here; other tools inject repositories/clients via DI.
  async execute({
    databaseUrl,
    readOnly = false,
    scope,
  }: {
    databaseUrl: string;
    readOnly?: boolean;
    scope?: { column: string; value: string | number };
  }): Promise<DynamicStructuredTool<z.ZodObject<{ query: z.ZodString }>>> {
    return tool(
      async ({ query }) => {
        /* sanitize (single statement, deny DELETE/DROP/…, force LIMIT 5),
           then run against a per-request TypeORM DataSource */
      },
      {
        name: 'execute_sql',
        description: '...', // pt-BR, tenant-agnostic — schema + REGRAS DE OURO
        schema: z.object({ query: z.string() }),
      },
    );
  }
}
```

### How tools are wired into agents

`ResolveAgentService.loadTools` reads per-tool boolean columns on `AgentEntity` — `parser_schema`, `vector_search_tool`, and `database_tool` — and assembles the toolbelt by invoking each enabled tool's `execute(...)`. For `database_tool`, `maybeLoadDatabaseTool` first checks that the agent's org has the `database_connection` feature enabled and a `database_url` set, then injects `LoadDatabaseToolService.execute({ databaseUrl })`; any missing prerequisite → the tool is silently absent. The `agent_identifier` column is a human-readable label and does **not** gate tools. See the `ai-agent-tools-and-rag` skill / `.claude/rules/agent-tools.md` for the full gate.

`src/components/Tools/LoadVectorSearchTool/` and `src/components/Tools/LoadDatabaseTool/` are the reference templates for tool-module shape — copy their structure when adding a new tool.

## Entities

All TypeORM entities live in `src/entities/` and are barrel-exported via `src/entities/index.ts`. Entity files use kebab-case: `user.entity.ts`, `order.entity.ts`.

Entities use decorators from `typeorm`: `@Entity`, `@Column`, `@PrimaryGeneratedColumn('uuid')`, etc.

## Types / Models

Type definitions live in `src/types/models/`. Each model file defines interfaces/types and is barrel-exported through `src/types/models/index.ts` → `src/types/index.ts`.

Import types from `src/types` (barrel), not from individual model files.

## Infrastructure (External Providers)

External service integrations live in `src/infrastructure/providers/`. Each provider file exports:

1. An injection token constant (e.g., `PAYMENT_GATEWAY_CLIENT`, `PUSH_NOTIFICATION_SERVICE`)
2. A service class (if needed)
3. A `Provider[]` array for NestJS DI registration

### Provider pattern

```typescript
export const MY_EXTERNAL_SERVICE = 'MY_EXTERNAL_SERVICE';

export class MyExternalService {
  constructor(@Inject(DEPENDENCY) private dep: Dep) {}
  // methods...
}

export const MyProvider: Provider[] = [
  {
    provide: MY_EXTERNAL_SERVICE,
    useFactory: (dep: Dep): MyExternalService => new MyExternalService(dep),
    inject: [DEPENDENCY],
  },
];
```

Each `<name>.provider.ts` has a sibling `<name>.provider.module.ts` that spreads
that one provider array and exports its tokens:

```typescript
@Module({
  imports: [VoyageEmbeddingsProviderModule], // only if a factory injects its token
  providers: [...SupabaseProvider],
  exports: [SUPABASE_CLIENT, SUPABASE_SERVICE],
})
export class SupabaseProviderModule {}
```

A use case that injects `SUPABASE_SERVICE` imports `SupabaseProviderModule` — and
nothing else from `infrastructure/`. Because `AppModule` no longer imports a
catch-all, a provider factory only runs when some module that needs it is
instantiated.

## Guards

Guards live in `src/auth/`:

- `AuthGuard` — JWT validation, role checking via `@Roles()` decorator, attaches `user` to request.
- Domain-specific guards — Implement business logic validations (e.g., Subscription checks, Access control policies).

Guards are applied per-endpoint using `@UseGuards(AuthGuard)`. The `@Public()` decorator marks endpoints as publicly accessible.

## Decorators

Custom decorators live in `src/decorators/`:

- `@Roles(...roles)` — Sets required roles metadata for `AuthGuard`
- `@User(field?)` — Extracts authenticated user (or a specific field) from the request

## Middleware

Middleware implementations live in `src/middleware/`. The `MiddlewareModule` registers them globally via `consumer.apply(...).forRoutes('*path')`.

## Controllers

- Use Fastify types (`FastifyReply`) for `@Res()`.
- DTOs are validated by the global pipe; plain `@Body() dto: XDto` is enough.
- DTOs use `class-validator` decorators (`@IsString`, `@IsNotEmpty`, `@IsEmail`, etc.).
- Controller method is typically named `handle` for single-action controllers, or uses semantic naming like `login`.
- Error handling: none in the controller; exceptions reach `GlobalExceptionFilter` and become `ErrorResponse`.

## Services

- Decorated with `@Injectable()`.
- Main method is named `execute(dto)`.
- Dependencies injected via constructor (repositories, other services, infrastructure tokens via `@Inject(TOKEN)`).

## Naming Conventions Summary

| Item                 | Naming                  | Example                   |
| -------------------- | ----------------------- | ------------------------- |
| Scope directory      | PascalCase              | `Order/`, `Auth/`         |
| Use case directory   | PascalCase              | `CreateOrder/`, `Login/`  |
| Files                | kebab-case              | `create-order.service.ts` |
| Module class         | PascalCase + Module     | `CreateOrderModule`       |
| Service class        | PascalCase + Service    | `CreateOrderService`      |
| Controller class     | PascalCase + Controller | `CreateOrderController`   |
| DTO class            | PascalCase + Dto        | `CreateOrderDto`          |
| Repository class     | PascalCase + Repository | `UserRepository`          |
| Entity class         | PascalCase + Entity     | `UserEntity`              |
| Infrastructure token | UPPER_SNAKE_CASE        | `PAYMENT_GATEWAY_CLIENT`  |

## Rules — NEVER Violate

1. **NEVER import more than the module needs** — the `imports` array is exactly the modules supplying what its own providers/controllers/guards inject.
2. **NEVER import a scope aggregator to reach one service** — import that use case's module. Aggregators have no `exports`.
3. **NEVER place business logic in controllers** — controllers delegate to services.
4. **NEVER skip the scope module** — every use case module must be imported in its scope module, which in turn is imported in `ComponentsModule`, or its route never registers.
5. **Every use case gets its own module** — even auxiliary ones without endpoints.
6. **DTOs use class-validator decorators** — never accept raw unvalidated input.
7. **Services use execute() as the main method name**`execute()`.
8. **Entity files go in src/entities/**`src/entities/`, not inside component folders.
9. **One tool = one module under `src/components/Tools/<ToolName>/`** — never bundle multiple tools into one service; never place tool modules outside the Tools scope.
