# Interceptors, decorators, erros e logging

## Quando criar uma abstração transversal

<regra critica="true">
Uma preocupação vira decorator + mecanismo global (`APP_INTERCEPTOR`, `APP_GUARD`, `APP_FILTER`) somente quando as três condições valem:

1. Aplica-se à maioria dos endpoints.
2. É fácil de esquecer e esquecer causa dano (segurança, auditoria, formato de erro).
3. O que varia por endpoint é um rótulo declarativo (string/flag), não lógica.

Se alguma falha, a lógica fica no controller/service do caso de uso.
</regra>

<regras>
- Mecanismo transversal é registrado globalmente, nunca por controller.
- O service não contém código de auditoria, autorização de rota, formatação de erro ou logging de request.
- Não criar interceptor global para moldar resposta de sucesso nem pipe global de paginação.
- Ao identificar código repetido em vários services que atende às três condições, extrair para decorator + mecanismo global.
</regras>

<estrutura>
Padrão de implementação:

```
decorator (SetMetadata com chave constante)
  → mecanismo global lê com Reflector
      flag/objeto único: getAllAndOverride(CHAVE, [handler, class])
      lista empilhável:  getAll(CHAVE, [handler, class])
```

</estrutura>

## Interceptor de auditoria

<exemplo>
```ts
// src/shared/decorators/auditoria.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const CHAVE_ACAO_AUDITORIA = 'auditoria:acao';

export interface MetadadosAcaoAuditoria {
readonly acao: string;
readonly tipoRecurso?: string;
}

export const AcaoAuditoria = (acao: string, tipoRecurso?: string): MethodDecorator & ClassDecorator =>
SetMetadata<string, MetadadosAcaoAuditoria>(CHAVE_ACAO_AUDITORIA, { acao, tipoRecurso });

````

```ts
// src/shared/http/interceptors/audit.interceptor.ts
const IGNORED_ROUTE_SUFFIXES = ['/health/live', '/health/ready', '/health/startup'];

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly auditLogs: RepositorioLogsAuditoria,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (!env.AUDIT_ENABLED || context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const route = request.routeOptions.url ?? request.url;

    if (IGNORED_ROUTE_SUFFIXES.some((suffix) => route.endsWith(suffix))) {
      return next.handle();
    }

    const reply = context.switchToHttp().getResponse<FastifyReply>();
    const startedAt = process.hrtime.bigint();
    const metadata = this.reflector.getAllAndOverride<MetadadosAcaoAuditoria>(CHAVE_ACAO_AUDITORIA, [
      context.getHandler(),
      context.getClass(),
    ]);

    return next.handle().pipe(
      finalize(() => {
        const durationMs = Number((process.hrtime.bigint() - startedAt) / 1_000_000n);
        void this.persist(request, reply, route, durationMs, metadata);
      }),
    );
  }

  private async persist(
    request: FastifyRequest,
    reply: FastifyReply,
    route: string,
    durationMs: number,
    metadata: MetadadosAcaoAuditoria | undefined,
  ): Promise<void> {
    const user = request.user;
    const params = request.params as Record<string, string> | undefined;

    try {
      await this.auditLogs.inserir({
        idCorrelacao: currentCorrelationId() ?? request.id,
        idUsuarioAtor: user?.id,
        tipoAtor: user?.tipo,
        acao: metadata?.acao ?? `${request.method} ${route}`,
        tipoRecurso: metadata?.tipoRecurso,
        idRecurso: params?.id,
        metodo: request.method,
        rota: route,
        caminho: request.url,
        codigoStatus: reply.statusCode,
        duracaoMs: durationMs,
        ip: request.ip,
        agenteUsuario: request.headers['user-agent'],
      });
    } catch (error: unknown) {
      this.logger.error('Falha ao gravar log de auditoria', error as Error);
    }
  }
}
````

</exemplo>

<regras>
- Registrado uma vez em `AppModule` como `APP_INTERCEPTOR`.
- Audita todo request HTTP, exceto rotas de health.
- `@AcaoAuditoria` só define o rótulo. Sem ele, a ação gravada é `"<MÉTODO> <rota>"`.
- Formato do rótulo: `'<recurso>.<verbo>'` + tipo de recurso. Ex.: `@AcaoAuditoria('papel.atribuir', 'papel')`.
- Gravação ocorre em `finalize()`, sem `await` no fluxo da resposta.
- Falha ao gravar auditoria gera log de erro e nunca afeta a resposta.
- Strings gravadas são truncadas ao tamanho da coluna.
- Auditoria é interceptor, nunca middleware.
- Tabela de auditoria não permite `UPDATE` nem exclusão (ver [`09-banco-de-dados.md`](09-banco-de-dados.md)).
</regras>

## Filtro global de exceção

<exemplo>
```ts
// src/shared/contracts/error-response.ts
export interface ErrorResponse {
  readonly category: ErrorCategory;
  readonly code: string;
  readonly message: string;
  readonly status: number;
  readonly correlationId: string;
  readonly timestamp: string;
  readonly path: string;
  readonly details?: readonly { field: string; message: string }[];
}
```

```ts
// src/shared/http/exception.filter.ts
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(error: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<FastifyRequest>();
    const reply = http.getResponse<FastifyReply>();

    const body = buildErrorResponse(error, {
      correlationId: currentCorrelationId() ?? 'no-correlation',
      path: request.url,
      exposeInternalDetails: !env.isProduction,
    });

    const logData = {
      method: request.method,
      route: request.url,
      status: body.status,
      errorCode: body.code,
    };

    if (body.status >= 500) {
      this.logger.error({ ...logData, exception: error }, 'request.error');
    } else {
      this.logger.warn(logData, 'request.rejected');
    }

    void reply.status(body.status).send(body);
  }
}
```

</exemplo>

<regras>
- Registrado uma vez em `AppModule` como `APP_FILTER`, com `@Catch()` sem argumento.
- Toda resposta de erro tem o formato `ErrorResponse`.
- Conversão em `src/shared/http/error-mapper.ts`:
  - `HttpException` → status e mensagem da exceção; `code = HTTP_<status>`; `category` derivada do status.
  - `ZodError` → 400, `category = VALIDATION`, `code = VALIDATION_FAILED`, `details` por campo.
  - qualquer outro erro → 500, `category = INTERNAL`, `code = INTERNAL_ERROR`.
- Em produção, erro não classificado (500) responde com mensagem genérica; a mensagem real fica só no log.
- Log: status ≥ 500 em `error` com a exceção; status < 500 em `warn`.
- `correlationId` vem do contexto do request, nunca de parâmetro.
</regras>

## Exceções

<tabela>

| Situação                                           | Exceção                        | Status | Categoria             |
| -------------------------------------------------- | ------------------------------ | ------ | --------------------- |
| Payload ou estado de entrada inválido              | `BadRequestException`          | 400    | `VALIDATION`          |
| Token ausente, inválido ou expirado                | `UnauthorizedException`        | 401    | `UNAUTHENTICATED`     |
| Autenticado sem permissão ou escopo                | `ForbiddenException`           | 403    | `FORBIDDEN`           |
| Recurso inexistente                                | `NotFoundException`            | 404    | `NOT_FOUND`           |
| Conflito de estado, unicidade ou versão            | `ConflictException`            | 409    | `CONFLICT`            |
| Pré-condição não satisfeita                        | `PreconditionFailedException`  | 412    | `PRECONDITION`        |
| Fonte externa falhou                               | `BadGatewayException`          | 502    | `EXTERNAL_DEPENDENCY` |
| Circuit breaker aberto ou dependência indisponível | `ServiceUnavailableException`  | 503    | `UNAVAILABLE`         |
| Falha inesperada                                   | `InternalServerErrorException` | 500    | `INTERNAL`            |

</tabela>

<regras>
- Nunca `throw new Error(...)`.
- Mensagem na língua do produto.
- Não criar classe de exceção nova se uma da tabela cobre o caso.
</regras>

## Decorators de rota

<tabela>

| Decorator                            | Alvo          | Função                                        | Lido por                 |
| ------------------------------------ | ------------- | --------------------------------------------- | ------------------------ |
| `@Publico()`                         | classe/método | Isenta a rota de autenticação e autorização   | guards globais           |
| `@ExigirPermissoes(...chaves)`       | classe/método | Permissões exigidas                           | guard de autorização     |
| `@Usuario(campo?)`                   | parâmetro     | Injeta o usuário autenticado ou um campo dele | —                        |
| `@AcaoAuditoria(acao, tipoRecurso?)` | classe/método | Rótulo da trilha de auditoria                 | interceptor de auditoria |

</tabela>

<regras>
- Decorators ficam em `src/shared/decorators/<nome>.decorator.ts`.
- Chaves de metadata são constantes exportadas (`src/auth/auth.constants.ts` para autenticação/autorização).
- Decorator de metadata é `MethodDecorator & ClassDecorator` criado com `SetMetadata`.
- Decorator de parâmetro é criado com `createParamDecorator`.
- Implementações: [`08-autenticacao-autorizacao.md`](08-autenticacao-autorizacao.md).
</regras>

## Correlação de request

<exemplo>
```ts
// src/shared/observability/correlation.ts
export interface RequestContext {
  readonly correlationId: string;
  readonly traceId?: string;
}

const storage = new AsyncLocalStorage<RequestContext>();

export function registerRequestContext(instance: FastifyInstance): void {
instance.addHook('onRequest', (request, reply, done) => {
reply.header('x-request-id', request.id);
storage.run(
{ correlationId: request.id, traceId: extractTraceId(request.headers.traceparent) },
done,
);
});
}

export function currentCorrelationId(): string | undefined {
return storage.getStore()?.correlationId;
}

````
</exemplo>

<regras>
- Existe um único `AsyncLocalStorage` de contexto de request no projeto. Logger, filtro, interceptor e cliente HTTP externo leem dele.
- `request.id` reutiliza o header `x-request-id` recebido se válido; senão gera UUID.
- A resposta devolve `x-request-id`.
- `traceId` vem do header `traceparent`.
</regras>

## Logging

<exemplo>
```ts
this.logger.info({ pedidoId, durationMs }, 'pedido.criado');
````

</exemplo>

<regras>
- Usar o logger (`nestjs-pino` / `Logger` do Nest). `console.log` é proibido.
- Primeiro argumento: campos estruturados. Segundo: nome do evento em `substantivo.verbo`.
- Não interpolar valores na mensagem.
- Não passar `correlationId` manualmente.
- Nunca registrar: token, header `Authorization`, cookie, senha, segredo, payload completo de integração, dado pessoal (CPF, e-mail, matrícula).
- Redação de campos sensíveis configurada no logger.
- Rotas de health não geram log de request.
- Nível por status: ≥ 500 `error`; 4xx `warn`; demais `info`.
</regras>

## Health

<regras>
- Três rotas públicas, com `@Publico()`: `/health/startup`, `/health/live`, `/health/ready`.
- `startup`: verifica se as migrations foram aplicadas.
- `live`: verifica apenas o processo. Nunca consulta o banco.
- `ready`: verifica dependências (pool do banco, memória).
</regras>
