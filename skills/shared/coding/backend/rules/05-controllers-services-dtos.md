# Regras de controller, service, DTO e repositório

Exemplos completos: [`04-anatomia-caso-de-uso.md`](04-anatomia-caso-de-uso.md).

<tabela>

| Arquivo             | Faz                                                                          | Nunca faz                                             |
| ------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------- |
| `*.controller.ts`   | Rota, extração e validação de entrada, chamada ao service, envio da resposta | Regra de negócio, acesso a banco                      |
| `*.service.ts`      | Regra de negócio, orquestração, transação, checagem de escopo de acesso      | Conhecer request/response HTTP, executar query do ORM |
| `*.repository.ts`   | Queries via ORM                                                              | Abrir transação, regra de negócio                     |
| `*.dto.ts`          | Formato validado de entrada                                                  | Servir de entidade de persistência                    |
| `models/*.model.ts` | Tipos de leitura/gravação derivados do schema                                | Conter comportamento                                  |

</tabela>

## Controller

<regras>
- Um único método público: `handle()`.
- `@Controller('<recurso>')` recebe o recurso público; a classe leva o nome do caso de uso. Controllers diferentes podem compartilhar o mesmo prefixo.
- Sempre `@Res() res: FastifyReply` e retorno `Promise<FastifyReply>`. Resposta enviada com `res.status(<codigo>).send(resultado)`.
- Status: 201 criação; 200 consulta ou atualização com corpo; 204 sem corpo.
- Sem `try/catch`. Exceções propagam para o filtro global.
- Sem `@UseGuards` e sem `@UseInterceptors`.
- Toda rota declara `@ExigirPermissoes(...)` ou `@Publico()`.
- Toda mutação declara `@AcaoAuditoria('<recurso>.<verbo>', '<recurso>')`.
- Ordem dos decorators do handler: verbo HTTP → `@ExigirPermissoes` → `@AcaoAuditoria` → decorators do Swagger.
- Classe recebe `@ApiTags('<dominio>')`; handler declara as respostas possíveis (`@ApiOkResponse`, `@ApiCreatedResponse`, `@ApiUnauthorizedResponse`, `@ApiForbiddenResponse`, `@ApiNotFoundResponse`).
- Parâmetros:
  - rota: `@Param('id', new ParseUUIDPipe())`
  - body: `@Body(new ValidationPipe({ forbidUnknownValues: true }))`
  - query: `@Query(new ValidationPipe({ transform: true, forbidUnknownValues: true }))`
  - usuário autenticado: `@Usuario() user: UsuarioAutenticado`
</regras>

## Service

<regras>
- Um único método público: `execute()`, com tipo de retorno explícito. Demais métodos são `private`.
- Injeta repositórios; nunca injeta o client do ORM (`DRIZZLE`).
- Toda query vive em repositório, mesmo as simples.
- Lança exceções nativas do Nest com mensagem na língua do produto: `BadRequestException`, `NotFoundException`, `ConflictException`, `ForbiddenException`, `InternalServerErrorException`. Nunca `throw new Error(...)`. Nunca retorna objeto de erro.
- Retorna tipo de `models/` ou interface declarada no próprio arquivo. Nunca expõe campo sensível ou interno do banco.
- **Service nunca itera a lista que o repositório devolveu para montar o payload** (`map`, `forEach`, `filter`, desestruturação para descartar campo). A projeção é feita na query: o service declara os campos num `as const` e os passa no argumento `campos` do método de listagem; a lista chega pronta e é devolvida como está. Lista de ids (`idsPermissoes`) sai do banco já agregada (`array_agg`), em método próprio do repositório. Iterar a lista para derivar outra coisa (validação, cálculo) é aceitável só quando o banco não consegue devolver o resultado. Ver [`09-banco-de-dados.md`](09-banco-de-dados.md#projeção-e-listagem).
- Abre transação via `ExecutorTransacao` quando grava em mais de uma tabela ou precisa de atomicidade; repassa `tx` a cada chamada de repositório.
- Leituras de pré-checagem e a releitura final ficam fora da transação.
- Efeito colateral externo (invalidar cache, publicar evento) ocorre após o commit, fora do callback da transação.
- Recurso de terceiro: após carregar o recurso, chamar `AccessScopeService.garantirPode(...)` (ver [`08-autenticacao-autorizacao.md`](08-autenticacao-autorizacao.md)).
- Recebe o usuário autenticado como parâmetro de `execute()` quando precisa do ator.
</regras>

## DTO

<regras>
- DTO de request HTTP usa `class-validator` + `class-transformer`. Zod não é usado em DTO.
- Todo campo tem decorator de validação. Strings têm `@MaxLength`. Arrays têm `@ArrayMaxSize`.
- Campo opcional: `@IsOptional()` primeiro.
- Objeto ou array aninhado: `@ValidateNested({ each: true })` + `@Type(() => SubDto)`. Sem `@Type`, o aninhado não é validado.
- Validação condicional entre campos: `@ValidateIf((dto) => condicao)`.
- Campo numérico em querystring: `@Type(() => Number)`.
- Paginação: `page = 1` com `@Min(1)`; `limit = 20` com `@Min(1)` e `@Max(100)`. Cada DTO de listagem declara seus próprios campos.
- Resposta de listagem: `{ items, total, totalPages, page, limit }`.
- Sem `@ApiProperty()` manual: o plugin Swagger lê os decorators de arquivos `*.dto.ts`.
- Mensagem customizada de validação na língua do produto.
</regras>

## Repositório

<regras>
- Uma classe `@Injectable()` concreta por agregado, sem interface: `RepositorioPedidos`.
- Local: `src/modules/<dominio>/repositories/[<agregado>/]<agregado>.repository.ts`, com `<agregado>-repository.module.ts` ao lado.
- Repositório usado por infraestrutura transversal (ex.: log de auditoria) fica em `src/infrastructure/database/repositories/<nome>/`.
- Injeta o banco com `@Inject(DRIZZLE) private readonly db: BancoDeDados`.
- Todo método público recebe `tx?: Executor` como último parâmetro e executa em `this.executor(tx)`.
- Nunca abre transação.
- Tipos de retorno derivam do schema (`$inferSelect`, `$inferInsert`, `Pick<>`). Filtros e resultados compostos são interfaces exportadas pelo arquivo do repositório.
- Sem classe base ou repositório genérico.
- Leitura pode fazer `join` com tabela de outro domínio; escrita só em tabela do próprio domínio (ver [`02-convencoes-fundamentais.md`](02-convencoes-fundamentais.md)).
- **Todo método de listagem recebe `campos?: readonly TCampo[]` antes de `tx`** (`listar(campos?, tx?)`; `buscarPaginado(filtro, campos?, tx?)`) e retorna `Pick<Linha, TCampo>[]`. A projeção vai para o `select` via `selecionarColunas(tabela, campos)` / `selecionarCampos(mapa, campos)` de `src/infrastructure/database/selecao-campos.ts`; sem `campos`, devolve todas as colunas. Nenhum `map`/`filter` sobre o resultado da query: coluna que não deve sair não entra no `select`; linha que não deve sair fica fora pelo `where`. Ver [`09-banco-de-dados.md`](09-banco-de-dados.md#projeção-e-listagem).
- Listagem paginada retorna `{ itens, total }`, com o total em uma query `count(*)` separada sobre o mesmo `where`, disparada em paralelo à página (`Promise.all`). `count(*) over()` não é usado: exigiria descartar a coluna `total` de cada linha.
</regras>

<exemplo>
```ts
@Injectable()
export class RepositorioPedidos {
  constructor(@Inject(DRIZZLE) private readonly db: BancoDeDados) {}

async buscarPorId(id: string, tx?: Executor): Promise<Pedido | undefined> {
return this.executor(tx).query.pedidos.findFirst({ where: eq(pedidos.id, id) });
}

async inserirPedido(valores: NovoPedido, tx?: Executor): Promise<Pedido> {
const [row] = await this.executor(tx).insert(pedidos).values(valores).returning();

    if (!row) {
      throw new InternalServerErrorException('Falha ao gravar o pedido');
    }

    return row;

}

async listarPedidos<TCampo extends keyof Pedido = keyof Pedido>(
campos?: readonly TCampo[],
tx?: Executor,
): Promise<Pick<Pedido, TCampo>[]> {
const linhas = await this.executor(tx)
.select(selecionarColunas(pedidos, campos))
.from(pedidos)
.orderBy(pedidos.criadoEm);

    return linhas as Pick<Pedido, TCampo>[];

}

private executor(tx?: Executor): Executor {
return tx ?? this.db;
}
}

````
</exemplo>

Uso no service de listagem:

<exemplo>
```ts
const CAMPOS_ITEM = ['id', 'codigo', 'status', 'criadoEm'] as const satisfies readonly (keyof ItemListaPedido)[];

@Injectable()
export class ListarPedidosService {
  constructor(private readonly pedidos: RepositorioPedidos) {}

  execute(): Promise<ItemListaPedido[]> {
    return this.pedidos.listarPedidos(CAMPOS_ITEM);
  }
}
````

</exemplo>

## Models

<exemplo>
```ts
// src/modules/pedidos/models/pedido.model.ts
import { type itensPedido } from 'src/infrastructure/database/schema/itens-pedido.schema';
import { type pedidos } from 'src/infrastructure/database/schema/pedidos.schema';

export type Pedido = typeof pedidos.$inferSelect;
export type NovoPedido = typeof pedidos.$inferInsert;
export type ItemPedido = typeof itensPedido.$inferSelect;

export type ItemListaPedido = Pick<Pedido, 'id' | 'codigo' | 'status' | 'createdAt'>;
export type DetalhesPedido = Pedido & { readonly itens: readonly ItemPedido[] };

```
</exemplo>

## Testes

<regras>
- Caso de uso é coberto por teste e2e em `test/<dominio>.e2e-spec.ts`, com banco real via Testcontainers.
- Função pura (cálculo, mapeador, tradução) tem `*.spec.ts` ao lado do arquivo.
- O nome do teste descreve comportamento, não o método chamado.
- Cobrir caminho de erro e borda da regra, não só o caminho feliz.
- Testes não dependem de ordem de execução.
- Não testar injeção de dependência do framework.
- Testes usam as mesmas fábricas de adapter e `ValidationPipe` de `main.ts`.
- Teste que passa a falhar após uma mudança: corrigir o código. Se o teste estiver errado, informar ao solicitante antes de alterá-lo. Nunca remover, pular ou enfraquecer teste para fazê-lo passar.
- Solução atende a todas as entradas válidas, não só às dos testes. Sem valor fixo no código para satisfazer um caso de teste.
</regras>
```
