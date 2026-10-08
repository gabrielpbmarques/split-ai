---
trigger: always_on
---

# Use cases: controller, service, DTO

Owns: the anatomy of a use case and the rules for each of its files. Repositories are in `database.md`; module wiring in `nest-modules.md`.

## Request flow

<structure>
```
Request
  → AuthenticationGuard → AuthorizationGuard        (global, src/auth/)
  → global ValidationPipe (DTO)
  → Controller.handle()
      → Service.execute()
          → Repository (+ TransactionExecutor)
  ← Controller sends the reply with res.status(...).send(...)
  → GlobalExceptionFilter turns any exception into ErrorResponse
```
</structure>

## What each file does

| File                                 | Does                                                            | Never does                                         |
| ------------------------------------ | --------------------------------------------------------------- | -------------------------------------------------- |
| `*.controller.ts`                    | route, input extraction, call to the service, sending the reply | business rules, database access                    |
| `*.service.ts`                       | business rules, orchestration, transactions                     | know about the HTTP request/reply, run ORM queries |
| `*.repository.ts`                    | queries                                                         | open transactions, business rules                  |
| `*.dto.ts`                           | validated input shape                                           | act as a persistence entity                        |
| `shared/contracts/models/*.model.ts` | read/write types                                                | contain behavior                                   |

## Controller

<example>
```ts
@ApiTags('agents')
@Controller('agent')
export class CreateAgentController {
  constructor(private readonly createAgentService: CreateAgentService) {}

@Post('create')
@RequirePermissions('agent.write')
@ApiBearerAuth()
@ApiCreatedResponse({ description: 'Agente criado' })
@ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
@ApiForbiddenResponse({ description: 'Permissão insuficiente' })
async handle(
@Body() dto: CreateAgentDto,
@AuthUser() user: AuthenticatedUser,
@Res() res: FastifyReply,
): Promise<FastifyReply> {
const result = await this.createAgentService.execute(dto, user);
return res.status(201).send(result);
}
}

````
</example>

<rules>
- One public method: `handle()`.
- `@Controller('<resource>')` takes the public resource path; the class is named after the use case. Several controllers may share a prefix.
- Always `@Res() res: FastifyReply`, returning `Promise<FastifyReply>` via `res.status(<code>).send(result)`.
- Status: 201 create; 200 read or update with body; 204 no body (`res.status(204).send()`).
- No `try/catch`: exceptions propagate to `GlobalExceptionFilter`. The streaming `QuestionController` is the only exception (it hijacks the reply; see `aichat-streaming.md`).
- No `@UseGuards` and no `@UseInterceptors`.
- Every route declares `@RequirePermissions(...)` or `@Public()`.
- Decorator order on the handler: HTTP verb → `@Public()` / `@RequirePermissions()` → Swagger decorators.
- The class has `@ApiTags('<domain>')`; the handler declares its possible responses (`@ApiOkResponse`, `@ApiCreatedResponse`, `@ApiUnauthorizedResponse`, `@ApiForbiddenResponse`, `@ApiNotFoundResponse`).
- Parameters:
  - route id: `@Param('id', new ParseUUIDPipe())` (or a plain string where an `agent_identifier` is also accepted)
  - body: `@Body() dto: XDto` — the global pipe validates it
  - query: `@Query() dto: XDto` — numeric fields need `@Type(() => Number)`
  - authenticated user: `@AuthUser() user: AuthenticatedUser` (`import { User as AuthUser } from 'src/shared/decorators/user.decorator'`)
- Open payloads (Twilio form, multipart) type the body as `Record<string, unknown>` or read `req.body`.
- The actor's identity always comes from `@AuthUser()`, never from the body.
</rules>

## Service

<example>
```ts
@Injectable()
export class GetSourceService {
  constructor(private readonly sourceRepository: SourceRepository) {}

  async execute(id: string): Promise<SourceEntity> {
    const source = await this.sourceRepository.findById(id);

    if (!source) {
      throw new NotFoundException('Fonte não encontrada');
    }

    return source;
  }
}
````

</example>

<rules>
- One public method: `execute()`, with an explicit return type. Other methods are `private`.
- Inject repositories; never inject TypeORM's `DataSource`/`EntityManager` or a raw `Repository<T>`. Every query lives in a repository, even simple ones.
- Throw native Nest exceptions with Portuguese messages (`BadRequestException`, `NotFoundException`, `ConflictException`, `ForbiddenException`, `ServiceUnavailableException`, `BadGatewayException`, `InternalServerErrorException`). Never `throw new Error(...)`, never return an error object. The status/category table is in `cross-cutting.md`.
- Return a type from `src/shared/contracts/models/` or an interface declared in the service file. Never expose sensitive or internal columns (`password_hash`, tokens, `database_url`).
- The service does not iterate the list the repository returned to build the payload (`map`, `forEach`, `filter`, destructuring to drop a field). The projection happens in the query: declare the fields in an `as const` tuple and pass them to the repository's `fields` argument; return the list as it comes. Iterating to derive something else (validation, a calculation) is acceptable only when the database cannot produce it. See `database.md`.
- Pagination: the DTO extends `PaginationDto`; the repository returns `PageResult`; the service returns `toPaginatedResponse(result, dto)` → `{ items, total, totalPages, page, limit }`.
- Open a transaction with `TransactionExecutor.run(async (tx) => …)` when writing to more than one table or when atomicity is required; pass `tx` to every repository call inside it.
- Pre-check reads and the final re-read stay outside the transaction. External side effects (vector store, e-mail, HTTP) run after the commit, outside the callback.
- `Promise.all` for independent reads that must all succeed; `Promise.allSettled` only for fire-and-forget side effects.
- Receive the authenticated user as an `execute()` parameter when the actor matters.
- Skip checks the guards already guarantee (a route with `@RequirePermissions('agent.write')` does not re-check the role).
</rules>

## DTO

<example>
```ts
export class ListSessionsDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  agent_id?: string;

@IsOptional()
@IsDateString()
start_date?: string;
}

```
</example>

<rules>
- HTTP request DTOs use `class-validator` + `class-transformer`. Zod is for env and external contracts only.
- The global pipe (`whitelist`, `forbidNonWhitelisted`, `forbidUnknownValues`, no implicit conversion) strips or rejects any field without a validator, so every field has one.
- Strings carry `@MaxLength`; arrays carry `@ArrayMaxSize` and `{ each: true }` validators.
- Optional field: `@IsOptional()` first. Required fields use `!`, optional ones `?`.
- Nested object or array: `@ValidateNested({ each: true })` + `@Type(() => SubDto)`; without `@Type` the nested value is not validated.
- Cross-field validation: `@ValidateIf((dto) => condition)`.
- Numeric query fields: `@Type(() => Number)`.
- Enums/unions: `@IsIn([...] as const)`; export the tuple when services need the type.
- No manual `@ApiProperty()`: the Swagger plugin reads `*.dto.ts`.
- Custom validation messages are in Portuguese.
</rules>

## Mutation vs. read

| Aspect | Mutation | Read |
| --- | --- | --- |
| Input | `@Body() dto` | `@Query() dto` or `@Param` with a pipe; no DTO file when the input is only a route param |
| `TransactionExecutorModule` | when writing to more than one table | never |
| Response type | model type | interface in the service file (list) or model type (detail) |
| Status | 201 create, 200 update with body, 204 no body | 200 |

## Recipe: create a use case

<checklist>
1. Follow the `new-feature-flow` skill first: answer its questions and present the plan before writing files.
2. Create `src/modules/<domain>/<verb>-<noun>/`.
3. Body or querystring → `<use-case>.dto.ts`. Route param only → no DTO.
4. Missing data access → add a method to the domain repository (`tx?: Executor` last on writes, `fields?` before `tx` on listings).
5. Missing return shape → add a type in `src/shared/contracts/models/`.
6. `<use-case>.service.ts` with the single public `execute()`.
7. `<use-case>.controller.ts` with the single `handle()` and its permission.
8. `<use-case>.module.ts` importing only the repository modules used.
9. Register the module in `imports` and `exports` of `<domain>.module.ts`.
10. Add the `it(...)` blocks to `test/<domain>.e2e-spec.ts` (see `tests.md`).
11. `bun run di:verify && bun run di:boot-check`.
</checklist>

The Nest CLI templates do not match these conventions; create the files by hand.
```
