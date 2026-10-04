---
name: code-patterns
description: 'Use for controller, service and DTO templates in this repo and for reviewing them: handle()/execute(), @Res() FastifyReply, status codes, global ValidationPipe, ErrorResponse, pagination, transactions, Promise.all vs allSettled. The delta over rule 05 of ai-agents-engineering.'
---

Rule `05-controllers-services-dtos.md` (and `04`, `07`) own the pattern. These are the templates already adapted to this repository's names.

## Controller

```typescript
@ApiTags('agents')
@Controller('agent')
export class CreateAgentController {
  constructor(private readonly createAgentService: CreateAgentService) {}

  @Post('create')
  @RequirePermissions('agent.write')
  @ApiCreatedResponse()
  @ApiBearerAuth()
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
```

- Decorator order: HTTP method → `@Public()` / `@RequirePermissions()` → `@RequireActiveOrganization()` → Swagger.
- `@Controller('<domain-path>')` is the domain path (`agent`, `organization`, `payment`), the method adds the action (`create`, `:id`, `list`).
- Status: 201 create, 200 read/update with body, 204 no body (`res.status(204).send()`).
- No try/catch, no business logic. Request-level checks throw Nest exceptions. The only streaming controller (`QuestionController`) hijacks the reply and writes its own `error`/`done` events.
- Open payloads (Twilio form, multipart) type the body as `Record<string, unknown>` or read `req.body`; the Stripe webhook reads `req.rawBody` (`rawBody: true` in `main.ts`).
- `user.id` / `user.organization_id` are nullable: `requireUserId(user)` / `requireOrganizationId(user)` when the service needs a string.

## Service

```typescript
@Injectable()
export class UpdateEmbedSettingsService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(id: string, dto: UpdateEmbedSettingsDto): Promise<EmbedSettings> {
    const organization = await this.organizationRepository.findById(id);
    if (!organization) throw new NotFoundException('Organização não encontrada');

    const updated = await this.organizationRepository.updateEmbedSettings(id, { ...dto });
    if (!updated) throw new NotFoundException('Organização não encontrada');

    return pickEmbedSettings(updated);
  }
}
```

- One public method, `execute`, with an explicit return type (a `Pick<>`/interface in `src/shared/contracts/models/` for subsets).
- Early return; no catch; exceptions in Portuguese reach `GlobalExceptionFilter` and become `ErrorResponse` (`{ category, code, message, status, correlationId, timestamp, path, details? }`).
- Ownership: `this.accessScope.ensureCan(user, 'source.write', { organizationId: source.organization_id }, 'Você não tem acesso a esta fonte.')`.
- Pagination: DTO extends `PaginationDto`; repository returns `PageResult`; `return toPaginatedResponse(page, dto)`.
- Transaction: `await this.transactionExecutor.run(async (tx) => { await repoA.create(a, tx); await repoB.update(id, b, tx); })`; pre-checks and external effects stay outside.
- `Promise.all` for independent reads that must all succeed; `Promise.allSettled` only for fire-and-forget side effects.
- Integration ports by token: `@Inject(VECTOR_STORE) private readonly vectorStore: VectorStoreGateway`.

## DTO

```typescript
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

- Every field has a validator or the global pipe strips/rejects it (`whitelist`, `forbidNonWhitelisted`, `forbidUnknownValues`). Strings carry `@MaxLength`, arrays `@ArrayMaxSize` and `{ each: true }` validators, numeric query fields `@Type(() => Number)`.
- Required fields use `!` (`strictPropertyInitialization`); optional ones `?`.
- Enums/unions via `@IsIn([...] as const)`; export the tuple when services need the type (`REPORT_SENTIMENTS`).

## Scaffolding a new use case

```bash
mkdir -p src/modules/<domain>/<verb-noun>
# create <verb-noun>.dto.ts, <verb-noun>.service.ts, <verb-noun>.controller.ts, <verb-noun>.module.ts by hand (the Nest CLI templates don't match these conventions)
# register the module in imports AND exports of src/modules/<domain>/<domain>.module.ts
bun run di:verify && bun run di:boot-check
# add the it(...) blocks to test/<domain>.e2e-spec.ts: happy path, 400, 401, 403, 404
```

Follow rule `11` first: answer the 18 questions and present the plan before writing these files.
