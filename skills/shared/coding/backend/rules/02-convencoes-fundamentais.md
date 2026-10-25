# Convenções fundamentais

## Módulo = domínio, caso de uso = ação

<regras>
- Módulo de domínio (`src/modules/<dominio>/`): um substantivo do negócio (`pedidos`, `usuarios`).
- Caso de uso (`<dominio>/<caso-de-uso>/`): uma ação dentro do domínio, `<verbo>-<substantivo>` (`criar-pedido`).
- Um caso de uso = um endpoint = um módulo Nest, com um controller, um service e seus DTOs.
- Não existe controller com múltiplos handlers nem service com múltiplos métodos públicos.
- Caso de uso auxiliar interno (sem endpoint, usado por outros services do mesmo domínio) tem apenas `service.ts` e `module.ts`.
</regras>

<estrutura>
```
modules/
  pedidos/
    pedidos.module.ts
    criar-pedido/
    listar-pedidos/
    cancelar-pedido/
    validar-estoque/        auxiliar interno: só service + module
    models/
    repositories/
```
</estrutura>

## Fronteiras entre módulos

<regra critica="true">
Um domínio nunca importa arquivo interno (service, handler, tipo interno) de outro domínio. Travessias permitidas:

- porta publicada em `contracts/` (token `Symbol` + interface);
- módulo de repositório exportado;
- módulo de caso de uso exportado (injeta-se o service que ele exporta).

Import interno acopla os dois domínios e cria dependência circular entre módulos Nest.
</regra>

Correto:

<exemplo>
```ts
import { EMISSAO_AVISOS, type EmissaoAvisosPort } from 'src/modules/avisos/contracts/emissao.port';

@Injectable()
export class CriarPedidoService {
constructor(@Inject(EMISSAO_AVISOS) private readonly avisos: EmissaoAvisosPort) {}
}

````
</exemplo>

Incorreto:

<exemplo>
```ts
import { AvisosEmissaoService } from 'src/modules/avisos/shared/emissao/avisos-emissao.service';
````

</exemplo>

## `join` entre tabelas de domínios diferentes

<regras>
- Leitura pode fazer `join` com tabela de outro domínio. Prefira um `join` a múltiplas consultas cruzadas em memória no service.
- O método pertence ao repositório do domínio da tabela do `FROM`.
- Escrita (`INSERT`/`UPDATE`/exclusão) só ocorre em tabela do próprio domínio. Para alterar dado de outro domínio, chame o service/repositório daquele domínio.
- Só faça `join` quando o endpoint realmente precisa dos dois dados.
</regras>

Método em `RepositorioLogsAuditoria`, domínio dono da tabela do `FROM`:

<exemplo>
```ts
async listarComUsuario(tx?: Executor): Promise<LogComUsuario[]> {
  return this.executor(tx)
    .select({ id: logsAuditoria.id, acao: logsAuditoria.acao, nomeUsuario: usuarios.nomeExibicao })
    .from(logsAuditoria)
    .leftJoin(usuarios, eq(usuarios.id, logsAuditoria.idUsuarioAtor));
}
```
</exemplo>

## Abstração

<regras>
- Interface, factory, porta ou camada só quando há mais de um implementador real ou implementação que troca por ambiente (mock vs. real).
- Fora disso: classe concreta injetada diretamente.
- Repositório de banco nunca tem interface + token.
- Não criar decorator, guard ou mecanismo sem um endpoint que o use.
- Regra de cálculo, vigência ou tradução de formato é função pura com teste unitário.
- Implementar a menor mudança que resolve o requisito. Sem refatoração de código não relacionado.
</regras>

## Idioma

<regras>
- Inglês: métodos (`handle`, `execute`), sufixos de papel (`Controller`, `Service`, `Module`, `Dto`), tokens de injeção, nomes de evento de log, colunas de ciclo de vida (`created_at`, `updated_at`, `deleted_at`).
- Língua do produto: vocabulário de domínio em pastas, classes, tabelas e colunas de negócio (`criar-pedido`, `CriarPedidoService`, `periodo_letivo`).
- Mensagens de erro ao usuário e descrições do Swagger: língua do produto.
- Nomes expressam a ação de negócio. Proibido: `ProcessData`, `Manager`, `Helper`, `Util`, `Handler` genérico.
</regras>

## Nomenclatura

<tabela>

| Papel                        | Arquivo                                           | Classe                                 |
| ---------------------------- | ------------------------------------------------- | -------------------------------------- |
| Módulo de caso de uso        | `criar-pedido.module.ts`                          | `CriarPedidoModule`                    |
| Módulo agregador de domínio  | `pedidos.module.ts`                               | `PedidosModule`                        |
| Controller                   | `criar-pedido.controller.ts`                      | `CriarPedidoController`                |
| Service                      | `criar-pedido.service.ts`                         | `CriarPedidoService`                   |
| DTO                          | `criar-pedido.dto.ts`                             | `CriarPedidoDto`                       |
| Repositório                  | `pedido.repository.ts`                            | `RepositorioPedidos`                   |
| Módulo de repositório        | `pedido-repository.module.ts`                     | `ModuloRepositorioPedidos`             |
| Model                        | `models/pedido.model.ts`                          | tipos (`Pedido`, `DetalhesPedido`)     |
| Tabela                       | `schema/pedidos.schema.ts`                        | `pedidos`                              |
| Porta                        | `emissao.port.ts`                                 | `EMISSAO_AVISOS` + `EmissaoAvisosPort` |
| Indicador de saúde           | `database.health.ts`                              | —                                      |
| Guard / filtro / interceptor | `*.guard.ts` / `*.filter.ts` / `*.interceptor.ts` | —                                      |
| Decorator                    | `*.decorator.ts`                                  | —                                      |
| Contrato de fonte externa    | `<fonte>.contracts.ts`                            | —                                      |
| Mapeador de fonte externa    | `<fonte>.mappers.ts`                              | —                                      |
| Teste unitário / e2e         | `*.spec.ts` / `*.e2e-spec.ts`                     | —                                      |

</tabela>

<regras>
- Arquivos e pastas: kebab-case.
- Verbos de caso de uso: criar, listar, buscar, atualizar, remover, aprovar, cancelar, revogar, atribuir, conceder, vincular, gerar.
- Interface não usa prefixo `I`.
- `public` é omitido; `private`/`protected` são explícitos.
</regras>

## Comentários

<regras>
- Não escrever comentários no código.
- O que precisaria de comentário vira nome melhor ou função menor.
- Intenção de teste vai no texto do `it(...)`.
- Proibido: cabeçalho de arquivo, `// TODO`, código comentado, JSDoc decorativo.
</regras>

## Tipagem

<regras>
- `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride` ligados.
- `import type` para o que é só tipo.
- Exceção: classe injetada por construtor sem `@Inject(TOKEN)` deve usar import normal. `import type` nesse caso quebra a injeção em runtime sem erro de compilação.
- Todo método público declara tipo de retorno.
</regras>
