---
trigger: glob
description: 'Casos de uso: fluxo de requisição, responsabilidades e regras de controller (handle), service (execute) e DTO (class-validator).'
globs: 'src/**/*.controller.ts, src/**/*.service.ts, src/**/*.dto.ts'
---

# Casos de uso: controller, service e DTO

Cobre: a anatomia de um caso de uso e as regras para cada um de seus arquivos. Repositórios estão em `04-banco-de-dados.md`; cabeamento de módulos em `02-modulos-e-injecao.md`.

## Fluxo de requisição

<estrutura>
```
Request
  → AuthenticationGuard → AuthorizationGuard        (globais, src/auth/)
  → ValidationPipe global (DTO)
  → Controller.handle()
      → Service.execute()
          → Repository (+ TransactionExecutor quando necessário)
  ← Controller envia a resposta com res.status(...).send(...)
  → GlobalExceptionFilter converte qualquer exceção em ErrorResponse
```
</estrutura>

## O que cada arquivo faz

<tabela>

| Arquivo                              | Faz                                                                   | Nunca faz                                          |
| ------------------------------------ | --------------------------------------------------------------------- | -------------------------------------------------- |
| `*.controller.ts`                    | Rota HTTP, extração de entrada, chamada ao service, envio da resposta | Regra de negócio, acesso a banco de dados          |
| `*.service.ts`                       | Regras de negócio, orquestração, transações                           | Conhecer request/reply HTTP, montar queries do ORM |
| `*.repository.ts`                    | Queries no banco de dados                                             | Abrir transações, conter regra de negócio          |
| `*.dto.ts`                           | Formato validado da entrada HTTP                                      | Atuar como entidade de persistência                |
| `shared/contracts/models/*.model.ts` | Tipos de leitura e escrita compartilhados                             | Conter comportamento ou lógica                     |

</tabela>

## Controller

<exemplo>
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
</exemplo>

<regras>
- Um único método público: `handle()`.
- `@Controller('<resource>')` recebe o caminho público do recurso em inglês; a classe tem o nome do caso de uso em inglês. Vários controllers podem compartilhar o mesmo prefixo de rota.
- Sempre injete `@Res() res: FastifyReply`, retornando `Promise<FastifyReply>` via `res.status(<code>).send(result)`.
- Status HTTP: `201` para criação; `200` para leitura ou atualização com corpo; `202` para processamento assíncrono aceito; `204` sem corpo (`res.status(204).send()`).
- Sem `try/catch`: exceções propagam para o `GlobalExceptionFilter`. O `QuestionController` de streaming é a única exceção sancionada (pois faz hijack da resposta; ver `10-chat-e-streaming.md` e PC-003).
- Sem `@UseGuards` e sem `@UseInterceptors`.
- Toda rota declara obrigatoriamente `@RequirePermissions(...)` ou `@Public()`.
- Ordem dos decoradores no handler: verbo HTTP → `@Public()` / `@RequirePermissions()` → decoradores do Swagger.
- A classe possui `@ApiTags('<domain>')`; o handler declara suas respostas possíveis com descrições em **português** (`@ApiOkResponse`, `@ApiCreatedResponse`, `@ApiUnauthorizedResponse`, `@ApiForbiddenResponse`, `@ApiNotFoundResponse`).
- Parâmetros do handler:
  - ID de rota: `@Param('id', new ParseUUIDPipe())` (ou `@Param('id') id: string` simples onde `agent_identifier` também é aceito);
  - Corpo: `@Body() dto: XDto` — o pipe global faz a validação;
  - Querystring: `@Query() dto: XDto` — campos numéricos exigem `@Type(() => Number)`;
  - Usuário autenticado: `@AuthUser() user: AuthenticatedUser` (`import { User as AuthUser } from 'src/shared/decorators/user.decorator'`).
- Payloads abertos (formulário Twilio, multipart) tipam o corpo como `Record<string, unknown>` ou leem da requisição Fastify.
- A identidade do ator vem sempre de `@AuthUser()`, nunca do corpo da requisição.
</regras>

## Service

<exemplo>
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

</exemplo>

<regras>
- Um único método público: `execute()`, com tipo de retorno explícito. Métodos auxiliares são `private`.
- Injete repositórios; nunca injete `DataSource` ou `EntityManager` do TypeORM nem `Repository<T>` cru. Toda query vive em um repositório, mesmo as simples.
- Lance exceções nativas do Nest com mensagens em **português** (`BadRequestException`, `NotFoundException`, `ConflictException`, `ForbiddenException`, `ServiceUnavailableException`, `BadGatewayException`, `InternalServerErrorException`). Nunca faça `throw new Error(...)` nem retorne objeto de erro. A tabela de status e categorias está em `05-transversais.md`.
- Retorne um tipo de `src/shared/contracts/models/` ou uma interface declarada no próprio arquivo do service. Nunca exponha colunas sensíveis ou internas (`password`, tokens).
- O service **não** itera sobre a lista retornada pelo repositório para moldar o payload de saída (`map`, `forEach`, `filter` ou desestruturação para remover campo). A projeção acontece na query do banco: declare os campos expostos em uma tupla `as const` e passe-a no argumento `fields` do repositório, retornando a lista diretamente. Iterar para derivar informação que o banco não produz (ex.: montar nós de um grafo ou validar regras) é aceitável apenas quando não puder ser feito via SQL/projeção. Ver `04-banco-de-dados.md` e a skill `fluxo-de-raciocinio`.
- Paginação: o DTO estende `PaginationDto`; o repositório retorna `PageResult`; o service retorna `toPaginatedResponse(result, dto)` → `{ items, total, totalPages, page, limit }`.
- Abra transação com `TransactionExecutor.run(async (tx) => …)` apenas quando escrever em mais de uma tabela ou quando atomicidade entre operações de banco for exigida; passe `tx` para todas as chamadas de repositório dentro do callback.
- Leituras de pré-checagem e a releitura final ficam fora da transação. Efeitos colaterais externos (vector store, HTTP, armazenamento em nuvem) rodam **após** o commit, fora do callback da transação.
- Use `Promise.all` para leituras ou resoluções independentes que precisam todas ter sucesso; use `Promise.allSettled` apenas para efeitos colaterais fire-and-forget. Nunca encadeie `await`s sequenciais para chamadas independentes e nunca resolva a mesma dependência duas vezes no mesmo método.
- Receba o usuário autenticado como parâmetro de `execute()` quando o ator importar para a regra de negócio.
- Pule checagens que os guards, pipes ou chamadores já garantem (uma rota com `@RequirePermissions('agent.write')` não revalida o papel do usuário), e reutilize métodos existentes nos repositórios (`findByIdOrIdentifier`, etc.) em vez de criar wrappers privados de busca nos services.
</regras>

## DTO

<exemplo>
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
</exemplo>

<regras>
- DTOs de requisição HTTP usam `class-validator` + `class-transformer`. Zod é usado apenas para `env.ts` e contratos de ferramentas/LLMs.
- O pipe global (`whitelist: true`, `forbidNonWhitelisted: true`, `forbidUnknownValues: true`, sem conversão implícita) rejeita qualquer campo sem decorador de validação; portanto, toda propriedade do DTO deve ter ao menos um validador.
- Strings levam `@MaxLength`; arrays levam `@ArrayMaxSize` e validadores com `{ each: true }`.
- Campo opcional: `@IsOptional()` primeiro. Campos obrigatórios usam `!`, opcionais usam `?`.
- Objeto ou array aninhado: `@ValidateNested({ each: true })` + `@Type(() => SubDto)` (sem `@Type`, o valor aninhado não é validado).
- Validação condicional entre campos: `@ValidateIf((dto) => condition)`.
- Campos numéricos em querystring: `@Type(() => Number)`.
- Enums/uniões: `@IsIn([...] as const)`; exporte a tupla quando os services precisarem do tipo.
- Não adicione `@ApiProperty()` manualmente sem necessidade: o plugin do Swagger lê os arquivos `*.dto.ts`.
- Mensagens de validação customizadas devem ser escritas em **português**.
</regras>

## Mutação vs. leitura

<tabela>

| Aspecto | Mutação (Escrita) | Leitura |
| --- | --- | --- |
| Entrada | `@Body() dto` | `@Query() dto` ou `@Param` com pipe; sem arquivo DTO quando a entrada for apenas parâmetro de rota |
| `TransactionExecutorModule` | Quando escrever em mais de uma tabela | Nunca |
| Tipo de resposta | Tipo de modelo (`shared/contracts/models/`) | Interface no arquivo do service (lista) ou tipo de modelo (detalhe) |
| Status HTTP | `201` criação, `200` atualização com corpo, `202` assíncrono, `204` sem corpo | `200` |

</tabela>

## Receita: criar um caso de uso

<checklist>
1. Siga primeiro a skill `nova-funcionalidade`: responda às perguntas de análise e apresente o plano antes de criar arquivos.
2. Crie a pasta `src/modules/<domain>/<verb>-<noun>/` (em inglês, `kebab-case`).
3. Se houver corpo ou querystring → crie `<use-case>.dto.ts`. Se houver apenas parâmetro de rota → sem DTO.
4. Se faltar acesso a dados → adicione o método ao repositório do domínio (`tx?: Executor` por último em escritas; `fields?` antes de `tx` em listagens).
5. Se faltar formato de retorno compartilhado → adicione o tipo em `src/shared/contracts/models/`.
6. Crie `<use-case>.service.ts` com o único método público `execute()`.
7. Crie `<use-case>.controller.ts` com o único método `handle()` e sua permissão `@RequirePermissions(...)`.
8. Crie `<use-case>.module.ts` importando apenas os módulos de repositório e casos de uso utilizados.
9. Registre o módulo em `imports` e `exports` de `<domain>.module.ts`.
10. Adicione os blocos `it(...)` correspondentes em `test/<domain>.e2e-spec.ts` (`11-testes.md`).
11. Execute `bun run di:verify && bun run di:boot-check`.
</checklist>

Os templates do Nest CLI não seguem estas convenções; crie os arquivos manualmente.
```
