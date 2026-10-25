# Anatomia de um caso de uso

Regras de cada arquivo: [`05-controllers-services-dtos.md`](05-controllers-services-dtos.md).

## Fluxo de um request

<fluxo>
```
Request
  → Guard de autenticação → Guard de autorização
  → ValidationPipe (DTO)
  → Controller.handle()
      → Service.execute()
          → Repository (+ ExecutorTransacao)
  ← Controller envia a resposta
  → AuditInterceptor grava a trilha após a resposta
  → GlobalExceptionFilter converte qualquer exceção em ErrorResponse
```
</fluxo>

## Caso de uso de mutação

<exemplo>
```ts
// src/modules/pedidos/criar-pedido/criar-pedido.dto.ts
import { Type } from 'class-transformer';
import {
  ArrayMaxSize, ArrayMinSize, IsArray, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID,
  MaxLength, Min, ValidateNested,
} from 'class-validator';

export class ItemPedidoDto {
@IsUUID()
idProduto: string;

@IsInt()
@Min(1)
quantidade: number;
}

export class CriarPedidoDto {
@IsString()
@IsNotEmpty()
@MaxLength(60)
codigo: string;

@IsOptional()
@IsString()
@MaxLength(1000)
observacao?: string;

@IsArray()
@ArrayMinSize(1)
@ArrayMaxSize(500)
@ValidateNested({ each: true })
@Type(() => ItemPedidoDto)
itens: ItemPedidoDto[];
}

````

```ts
// src/modules/pedidos/criar-pedido/criar-pedido.controller.ts
import { Body, Controller, Post, Res, ValidationPipe } from '@nestjs/common';
import { ApiCreatedResponse, ApiForbiddenResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { type FastifyReply } from 'fastify';

import { CriarPedidoDto } from 'src/modules/pedidos/criar-pedido/criar-pedido.dto';
import { CriarPedidoService } from 'src/modules/pedidos/criar-pedido/criar-pedido.service';
import { type UsuarioAutenticado } from 'src/modules/usuarios/models/usuario-autenticado.model';
import { AcaoAuditoria } from 'src/shared/decorators/auditoria.decorator';
import { ExigirPermissoes } from 'src/shared/decorators/permissoes.decorator';
import { Usuario } from 'src/shared/decorators/usuario-atual.decorator';

@ApiTags('pedidos')
@Controller('pedidos')
export class CriarPedidoController {
  constructor(private readonly criarPedidoService: CriarPedidoService) {}

  @Post()
  @ExigirPermissoes('pedido.write')
  @AcaoAuditoria('pedido.criar', 'pedido')
  @ApiCreatedResponse({ description: 'Pedido criado' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(
    @Body(new ValidationPipe({ forbidUnknownValues: true })) body: CriarPedidoDto,
    @Usuario() user: UsuarioAutenticado,
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    const resultado = await this.criarPedidoService.execute(body, user);
    return res.status(201).send(resultado);
  }
}
````

```ts
// src/modules/pedidos/criar-pedido/criar-pedido.service.ts
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { ExecutorTransacao } from 'src/infrastructure/database/executor-transacao/executor-transacao.service';
import { type CriarPedidoDto } from 'src/modules/pedidos/criar-pedido/criar-pedido.dto';
import { type DetalhesPedido } from 'src/modules/pedidos/models/pedido.model';
import { RepositorioPedidos } from 'src/modules/pedidos/repositories/pedido.repository';
import { type UsuarioAutenticado } from 'src/modules/usuarios/models/usuario-autenticado.model';

@Injectable()
export class CriarPedidoService {
  constructor(
    private readonly pedidos: RepositorioPedidos,
    private readonly executorTransacao: ExecutorTransacao,
  ) {}

  async execute(
    dados: CriarPedidoDto,
    usuario: UsuarioAutenticado,
  ): Promise<DetalhesPedido> {
    if (await this.pedidos.existePorCodigo(dados.codigo)) {
      throw new ConflictException('Já existe um pedido com este código');
    }

    const idPedido = await this.executorTransacao.executar(async (tx) => {
      const pedido = await this.pedidos.inserirPedido(
        {
          codigo: dados.codigo,
          observacao: dados.observacao,
          idUsuarioCriador: usuario.id,
        },
        tx,
      );

      await this.pedidos.inserirItens(
        dados.itens.map((item) => ({
          idPedido: pedido.id,
          idProduto: item.idProduto,
          quantidade: item.quantidade,
        })),
        tx,
      );

      return pedido.id;
    });

    const detalhes = await this.pedidos.buscarDetalhesPorId(idPedido);

    if (!detalhes) {
      throw new InternalServerErrorException(
        'Falha ao carregar o pedido recém-criado',
      );
    }

    return detalhes;
  }
}
```

```ts
// src/modules/pedidos/criar-pedido/criar-pedido.module.ts
@Module({
  imports: [ModuloRepositorioPedidos, ModuloExecutorTransacao],
  controllers: [CriarPedidoController],
  providers: [CriarPedidoService],
  exports: [CriarPedidoService],
})
export class CriarPedidoModule {}
```

</exemplo>

## Caso de uso de leitura paginada

<exemplo>
```ts
// listar-pedidos.dto.ts
export class ListarPedidosDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

@IsOptional()
@Type(() => Number)
@IsInt()
@Min(1)
@Max(100)
limit = 20;

@IsOptional()
@IsString()
status?: string;
}

````

```ts
// listar-pedidos.controller.ts
@ApiTags('pedidos')
@Controller('pedidos')
export class ListarPedidosController {
  constructor(private readonly service: ListarPedidosService) {}

  @Get()
  @ExigirPermissoes('pedido.read')
  @ApiOkResponse({ description: 'Lista paginada de pedidos' })
  async handle(
    @Query(new ValidationPipe({ transform: true, forbidUnknownValues: true })) query: ListarPedidosDto,
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    const resultado = await this.service.execute(query);
    return res.status(200).send(resultado);
  }
}
````

```ts
// listar-pedidos.service.ts
export interface RespostaListarPedidos {
  readonly items: readonly ItemListaPedido[];
  readonly total: number;
  readonly totalPages: number;
  readonly page: number;
  readonly limit: number;
}

@Injectable()
export class ListarPedidosService {
  constructor(private readonly pedidos: RepositorioPedidos) {}

  async execute(dto: ListarPedidosDto): Promise<RespostaListarPedidos> {
    const resultado = await this.pedidos.buscarPaginado({
      pagina: dto.page,
      limite: dto.limit,
      status: dto.status,
    });

    return {
      items: resultado.itens,
      total: resultado.total,
      totalPages: Math.ceil(resultado.total / dto.limit),
      page: dto.page,
      limit: dto.limit,
    };
  }
}
```

```ts
// listar-pedidos.module.ts
@Module({
  imports: [ModuloRepositorioPedidos],
  controllers: [ListarPedidosController],
  providers: [ListarPedidosService],
  exports: [ListarPedidosService],
})
export class ListarPedidosModule {}
```

</exemplo>

## Caso de uso de leitura por id

Entrada só por parâmetro de rota: não existe arquivo `.dto.ts`.

<exemplo>
```ts
// buscar-pedido.controller.ts
@Get(':id')
@ExigirPermissoes('pedido.read')
async handle(
  @Param('id', new ParseUUIDPipe()) id: string,
  @Res() res: FastifyReply,
): Promise<FastifyReply> {
  const resultado = await this.service.execute(id);
  return res.status(200).send(resultado);
}
```

```ts
// buscar-pedido.service.ts
async execute(id: string): Promise<DetalhesPedido> {
  const detalhes = await this.pedidos.buscarDetalhesPorId(id);

  if (!detalhes) {
    throw new NotFoundException('Pedido não encontrado');
  }

  return detalhes;
}
```

</exemplo>

## Mutação vs. leitura

<tabela>

| Aspecto                   | Mutação                                                    | Leitura                                                                                           |
| ------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Entrada                   | `@Body(new ValidationPipe({ forbidUnknownValues: true }))` | `@Query(new ValidationPipe({ transform: true, forbidUnknownValues: true }))` ou `@Param` com pipe |
| `@AcaoAuditoria`          | sempre                                                     | não                                                                                               |
| `ModuloExecutorTransacao` | se grava em mais de uma tabela                             | nunca                                                                                             |
| Tipo de resposta          | tipo de `models/`                                          | interface no arquivo do service (listagem) ou tipo de `models/` (detalhe)                         |
| Status                    | 201 criação, 200 atualização com corpo, 204 sem corpo      | 200                                                                                               |

</tabela>

## Receita: criar um caso de uso

<checklist>
1. Criar `src/modules/<dominio>/<verbo>-<substantivo>/`.
2. Se há body ou querystring: criar `<caso>.dto.ts`. Se a entrada é só parâmetro de rota: sem DTO.
3. Se falta acesso a dado: adicionar método ao repositório do domínio, com `tx?: Executor` como último parâmetro.
4. Se falta shape de retorno: adicionar tipo em `models/`.
5. Criar `<caso>.service.ts` com o único método público `execute()`.
6. Criar `<caso>.controller.ts` com o único handler `handle()`, permissão exigida e, em mutação, `@AcaoAuditoria`.
7. Criar `<caso>.module.ts` importando apenas os módulos de repositório usados.
8. Registrar o módulo em `imports` e `exports` de `<dominio>.module.ts`.
9. Criar ou atualizar o teste e2e em `test/`.
</checklist>
