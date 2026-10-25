# Autenticação e autorização

<regra critica="true">
- A API é Resource Server: apenas verifica tokens Bearer emitidos por IdP externo. Não tem rota de login, logout ou refresh, não emite token, não mantém sessão.
- Toda rota é privada por padrão. Única exceção: `@Publico()`.
- O IdP define quem é o ator; o banco da aplicação define papéis e permissões.
- Proibido criar flag, variável de ambiente ou atalho que desligue ou contorne autenticação, inclusive em teste. Teste usa stub local de JWKS e tokens assinados contra ele.
- Nenhum controller usa `@UseGuards`.
- Detalhes do IdP (JWKS, issuer, audience, nomes de claim) ficam exclusivamente dentro da implementação do verificador de token.

Atalho de autenticação criado para teste acaba em produção; detalhe de IdP fora do verificador espalha a troca de IdP por todo o código.
</regra>

## Estrutura

<estrutura>
```
src/auth/
  auth.module.ts                 registra os dois APP_GUARD
  auth.constants.ts              chaves de metadata
  authentication.guard.ts        autenticação
  authorization.guard.ts         autorização por metadata
  token.verifier.ts              verificação do token (única peça específica do IdP)
  principal-resolver.service.ts  principal → usuário local + permissões efetivas
  access-scope.service.ts        autorização por recurso, usada nos services
  request-user.ts                exigirUsuario(request)
src/shared/decorators/
  publico.decorator.ts
  permissoes.decorator.ts
  usuario-atual.decorator.ts
  auditoria.decorator.ts
```
</estrutura>

## Módulo

<exemplo>
```ts
@Module({
  imports: [ModuloRepositorioUsuarios, ModuloRepositorioPapeis, ModuloExecutorTransacao],
  providers: [
    TokenVerifier,
    PrincipalResolverService,
    AccessScopeService,
    { provide: APP_GUARD, useClass: AuthenticationGuard },
    { provide: APP_GUARD, useClass: AuthorizationGuard },
  ],
  exports: [PrincipalResolverService, AccessScopeService],
})
export class AuthModule {}
```
</exemplo>

<regra>
A ordem dos `APP_GUARD` é obrigatória: autenticação primeiro, autorização depois.
</regra>

## Verificador de token

<exemplo>
```ts
export interface Principal {
  readonly idObjeto: string;
  readonly idLocatario: string;
  readonly tipo: 'user' | 'app';
  readonly escopos: readonly string[];
  readonly papeisDaReivindicacao: readonly string[];
}

export declare class TokenVerifier {
verify(token: string): Promise<Principal>;
}

````
</exemplo>

<regras>
- Valida assinatura, emissor, audiência e expiração.
- Qualquer falha lança `UnauthorizedException`.
- Trocar de IdP altera somente esta classe.
- A verificação é implementada diretamente nesta classe, sem Passport nem estratégia de autenticação de biblioteca.
</regras>

## Resolvedor de principal

<exemplo>
```ts
export interface UsuarioAutenticado {
  readonly id: string;
  readonly idObjeto: string;
  readonly idLocatario: string;
  readonly tipo: 'user' | 'app';
  readonly papeis: readonly string[];
  readonly permissoes: readonly string[];
  readonly acessos: readonly AcessoDesignado[];
}

export interface AcessoDesignado {
  readonly chavePapel: string;
  readonly tipoEscopo: TipoEscopo;
  readonly idEscopo: string | null;
  readonly permissoes: readonly string[];
}

export interface ContextoRequisicao {
  readonly metodo: string;
  readonly rota: string;
  readonly ip: string;
}

export declare class PrincipalResolverService {
  resolve(principal: Principal, contexto: ContextoRequisicao): Promise<UsuarioAutenticado>;
  invalidate(idLocatario: string, idObjeto: string): void;
}
````

</exemplo>

<regras>
- Chave de identidade do usuário: par `(idLocatario, idObjeto)`. Nunca a claim `sub`.
- Usuário inativo ou não provisionado: `ForbiddenException`.
- Calcula as permissões efetivas e as anexa ao usuário.
- Cache em memória por identidade, com TTL de `env.AUTH_PRINCIPAL_CACHE_TTL_MS`. O token nunca é cacheado.
- Todo caso de uso que altera papel, permissão ou status de um usuário chama `invalidate(...)` após o commit.
- Sincronização de papéis vindos de claim do token:
  - claim presente com valores → sincroniza;
  - claim presente e vazia → remove atribuições de origem IdP;
  - claim ausente ou ilegível → não altera nada;
  - atribuições de origem manual nunca são alteradas.
</regras>

## Guard de autenticação

<exemplo>
```ts
@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly verifier: TokenVerifier,
    private readonly principalResolver: PrincipalResolverService,
  ) {}

async canActivate(context: ExecutionContext): Promise<boolean> {
const isPublic = this.reflector.getAllAndOverride<boolean>(CHAVE_PUBLICA, [
context.getHandler(),
context.getClass(),
]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const token = this.extractBearerToken(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException('Token de acesso ausente');
    }

    const principal = await this.verifier.verify(token);

    request.user = await this.principalResolver.resolve(principal, {
      metodo: request.method,
      rota: request.routeOptions.url ?? request.url,
      ip: request.ip,
    });

    return true;

}

private extractBearerToken(header: string | undefined): string | undefined {
if (!header) {
return undefined;
}

    const [scheme, value] = header.split(' ', 2);

    return value && scheme?.toLowerCase() === 'bearer' ? value.trim() : undefined;

}
}

````
</exemplo>

<regra>
`request.user` é tipado por augmentação em `src/types/fastify.d.ts`.
</regra>

## Guard de autorização

<exemplo>
```ts
@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const targets = [context.getHandler(), context.getClass()];

    if (this.reflector.getAllAndOverride<boolean>(CHAVE_PUBLICA, targets)) {
      return true;
    }

    const user = exigirUsuario(context.switchToHttp().getRequest<FastifyRequest>());

    const niveis = this.reflector
      .getAll<(string[] | undefined)[]>(CHAVE_PERMISSOES_OBRIGATORIAS, targets)
      .filter((valor): valor is string[] => Array.isArray(valor) && valor.length > 0);

    for (const nivel of niveis) {
      if (nivel.every((permissao) => !user.permissoes.includes(permissao))) {
        throw new ForbiddenException('Permissão insuficiente para acessar este recurso');
      }
    }

    return true;
  }
}
````

</exemplo>

<regras>
- Não faz I/O: compara metadata com `request.user`.
- Dentro de um `@ExigirPermissoes('A', 'B')`: basta uma (OU).
- Entre decorator de classe e de método: todos os níveis devem ser satisfeitos (E).
</regras>

## Decorators

<exemplo>
```ts
// src/auth/auth.constants.ts
export const CHAVE_PUBLICA = 'auth:isPublic';
export const CHAVE_PERMISSOES_OBRIGATORIAS = 'auth:permissoes';
```

```ts
// publico.decorator.ts
export const Publico = (): MethodDecorator & ClassDecorator =>
  SetMetadata(CHAVE_PUBLICA, true);
```

```ts
// permissoes.decorator.ts
export const ExigirPermissoes = (
  ...chavesPermissoes: string[]
): MethodDecorator & ClassDecorator =>
  SetMetadata(CHAVE_PERMISSOES_OBRIGATORIAS, chavesPermissoes);
```

```ts
// usuario-atual.decorator.ts
export const Usuario = createParamDecorator(
  (
    campo: keyof UsuarioAutenticado | undefined,
    contexto: ExecutionContext,
  ): unknown => {
    const requisicao = contexto.switchToHttp().getRequest<FastifyRequest>();
    const usuario = exigirUsuario(requisicao);

    return campo ? usuario[campo] : usuario;
  },
);
```

```ts
// src/auth/request-user.ts
export function exigirUsuario(request: FastifyRequest): UsuarioAutenticado {
  if (!request.user) {
    throw new UnauthorizedException('Usuário não autenticado');
  }

  return request.user;
}
```

</exemplo>

<regras>
- `@Publico()` é usado apenas em rotas de health, salvo requisito explícito.
- Chave de permissão: `<recurso>.<acao>` (`pedido.read`, `pedido.write`) ou `<AREA>.<RECURSO>.<ACAO>` (`ADMIN.ATRIBUICAO.GERENCIAR`). Manter um único formato por projeto.
- Autorização de rota é por permissão, não por papel.
- Decorators de papel, escopo OAuth ou token de aplicação só são criados quando um endpoint exigir. Nunca combinar, no mesmo endpoint, exigência de escopo delegado de usuário com exigência de papel de aplicação.
</regras>

## Duas camadas de autorização

<regra critica="true">
- Guard: "o usuário tem a permissão X?"
- `AccessScopeService`: "o usuário tem a permissão X neste recurso?"

Endpoint que lê ou altera recurso de terceiro usa as duas. A segunda é chamada no service, após carregar o recurso. Checagem de posse/escopo inline no service é proibida.
</regra>

<exemplo>
```ts
export type TipoEscopo = 'global' | 'unidade';

export interface EscopoRecurso {
readonly tipoEscopo: TipoEscopo;
readonly idEscopo: string;
}

export declare class AccessScopeService {
pode(usuario: UsuarioAutenticado, permissao: string, escopo: EscopoRecurso): boolean;
garantirPode(usuario: UsuarioAutenticado, permissao: string, escopo: EscopoRecurso): void;
escoposAlcancaveis(usuario: UsuarioAutenticado, permissao: string, tipoEscopo: TipoEscopo): 'all' | string[];
}

````

```ts
async execute(idPedido: string, usuario: UsuarioAutenticado): Promise<DetalhesPedido> {
  const pedido = await this.pedidos.buscarDetalhesPorId(idPedido);

  if (!pedido) {
    throw new NotFoundException('Pedido não encontrado');
  }

  this.accessScope.garantirPode(usuario, 'pedido.write', { tipoEscopo: 'unidade', idEscopo: pedido.idUnidade });

  return pedido;
}
````

</exemplo>

<regras>
- `garantirPode` lança `ForbiddenException` quando `pode` retorna `false`.
- `TipoEscopo` é declarado em `access-scope.service.ts`. Tipo de escopo novo é adicionado à união e à hierarquia.
- A hierarquia de escopos é fixa no código de `AccessScopeService`; escopo superior cobre os inferiores; `global` cobre todos.
- Listagem filtrada por permissão usa `escoposAlcancaveis`: `'all'` não filtra; lista de ids filtra.
</regras>

## Modelo de permissões

<tabela>

| Tabela                | Conteúdo                                                                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `papeis`              | `chave` única, `nome`, `ativo`                                                                                                                    |
| `permissoes`          | `chave` única, `modulo`, `nome`, `ativa`                                                                                                          |
| `permissoes_papeis`   | papel → permissões                                                                                                                                |
| `papeis_usuarios`     | atribuição: usuário, papel, `tipo_escopo`, `id_escopo`, `valido_desde`, `valido_ate`, `revogado_em`, `revogado_por`, `origem` (`idp` \| `manual`) |
| `permissoes_usuarios` | exceção: usuário, permissão, `efeito` (`conceder` \| `negar`), escopo, vigência, revogação, `justificativa` obrigatória                           |

</tabela>

<regras>
```
Efetivas = (permissões dos papéis ativos ∪ exceções CONCEDER ativas) − exceções NEGAR ativas
```

- NEGAR prevalece sobre qualquer concessão.
- NEGAR global remove a permissão de todos os escopos; NEGAR com escopo remove só daquele escopo.
- Ativo = `revogado_em` nulo e data atual dentro da vigência. Calculado na leitura.
- Revogação é lógica: preenche `revogado_em` e `revogado_por`.
- `id_escopo` é nulo se e somente se `tipo_escopo = 'global'` (constraint de banco).
- `justificativa` não vazia é constraint de banco.
</regras>
