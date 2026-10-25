---
trigger: glob
description: 'Preocupações transversais: filtro global de exceção, ErrorResponse, tabela de exceções, decoradores de rota, correlação, logging e health checks.'
globs: 'src/shared/http/**, src/shared/decorators/**, src/shared/observability/**'
---

# Preocupações transversais: erros, decoradores, correlação, logging e health

Cobre: quando uma preocupação vira mecanismo global, o filtro de exceções e `ErrorResponse`, a tabela de exceções HTTP, decoradores de rota, correlação de requisição, logging estruturado e rotas de health check.

## Quando construir uma abstração transversal

<regra critica="true">
Uma preocupação só vira um decorador + mecanismo global (`APP_GUARD`, `APP_FILTER`, `APP_INTERCEPTOR`) quando **todas as três** condições abaixo forem verdadeiras:

1. Aplica-se à maioria dos endpoints.
2. É fácil esquecer, e esquecê-la causa dano real (segurança, contrato de erro).
3. O que varia por endpoint é apenas um rótulo declarativo (string/flag), não lógica de negócio.

Se qualquer uma falhar, a lógica permanece no controller ou service do caso de uso.
</regra>

<regras>
- Um mecanismo transversal é registrado globalmente (`AppModule` ou `AuthModule`), nunca por controller (`@UseGuards`, `@UseFilters`, `@UseInterceptors` são proibidos em controllers).
- Services não contêm autorização de rota, formatação de resposta de erro nem log de requisição HTTP.
- Não existe interceptor global para envelopar respostas de sucesso nem pipe global de paginação.
- Padrão de implementação: decorador (`SetMetadata` com chave constante) → mecanismo global lê com `Reflector` (`getAllAndOverride(KEY, [handler, class])` para flag única/objeto, `getAll(KEY, [handler, class])` para listas acumuláveis).
- Não há interceptor de auditoria nem tabela `audit_logs` neste produto.
</regras>

## Filtro global de exceção (`GlobalExceptionFilter`)

<regras>
- `GlobalExceptionFilter` (`src/shared/http/exception.filter.ts`) é registrado uma única vez em `AppModule` como `APP_FILTER`, com `@Catch()` sem argumentos.
- Toda resposta de erro segue o contrato `ErrorResponse`: `{ category, code, message, status, correlationId, timestamp, path, details? }` (`src/shared/contracts/error-response.ts`).
- A conversão mora em `src/shared/http/error-mapper.ts`:
  - `HttpException` → usa seu status e mensagem; `code = HTTP_<status>`; `category` derivada do status; erros de validação do pipe viram `details` por campo;
  - `ZodError` → status `400`, `category = VALIDATION`, `code = VALIDATION_FAILED`, `details` por campo;
  - qualquer outro erro → status `500`, `category = INTERNAL`, `code = INTERNAL_ERROR`.
- Em produção (`env.isProduction`), um erro `500` não classificado responde com mensagem genérica em português; a mensagem real fica apenas no log.
- Nível de log no filtro: status ≥ 500 em `error` com a exceção; status < 500 em `warn`.
- `correlationId` vem sempre do contexto da requisição (`AsyncLocalStorage`), nunca de parâmetro manual.
- Uma resposta de streaming sequestrada com `res.hijack()` (`QuestionController`) já enviou os headers (`headersSent`) e fica fora do filtro global, escrevendo seu próprio evento `{ type: 'error' }` seguido de `{ type: 'done' }` (PC-003).
</regras>

## Tabela de exceções

<tabela>

| Situação                                                                 | Exceção                                            | Status | Categoria (`ErrorCategory`) |
| ------------------------------------------------------------------------ | -------------------------------------------------- | ------ | --------------------------- |
| Payload ou estado de entrada inválido                                    | `BadRequestException`                              | 400    | `VALIDATION`                |
| Token ausente, inválido ou expirado                                      | `UnauthorizedException` (apenas na camada `auth/`) | 401    | `UNAUTHENTICATED`           |
| Autenticado, mas sem permissão                                           | `ForbiddenException`                               | 403    | `FORBIDDEN`                 |
| Recurso não existe                                                       | `NotFoundException`                                | 404    | `NOT_FOUND`                 |
| Conflito de estado, unicidade ou versão                                  | `ConflictException`                                | 409    | `CONFLICT`                  |
| Pré-condição não atendida                                                | `PreconditionFailedException`                      | 412    | `PRECONDITION`              |
| Dependência externa respondeu fora do contrato                           | `BadGatewayException`                              | 502    | `EXTERNAL_DEPENDENCY`       |
| Integração `NOT_CONFIGURED`, circuito aberto ou dependência indisponível | `ServiceUnavailableException`                      | 503    | `UNAVAILABLE`               |
| Falha inesperada                                                         | `InternalServerErrorException`                     | 500    | `INTERNAL`                  |

</tabela>

<regras>
- Nunca faça `throw new Error(...)` em código de requisição.
- Mensagens de exceção são sempre em **português**.
- Não crie uma nova classe de exceção quando uma das classes nativas da tabela cobrir o caso.
</regras>

## Decoradores de rota

<tabela>

| Decorador                                   | Alvo            | Finalidade                                                        | Lido por                |
| ------------------------------------------- | --------------- | ----------------------------------------------------------------- | ----------------------- |
| `@Public()`                                 | classe / método | Isenta a rota de autenticação e autorização                       | Ambos os guards globais |
| `@RequirePermissions(...keys)`              | classe / método | Permissões exigidas (chaves tipadas de `src/auth/permissions.ts`) | `AuthorizationGuard`    |
| `@User(field?)` (importado como `AuthUser`) | parâmetro       | Injeta o `AuthenticatedUser` ou um campo específico dele          | —                       |

</tabela>

<regras>
- Decoradores vivem em `src/shared/decorators/<name>.decorator.ts`.
- Chaves de metadados são constantes exportadas em `src/auth/auth.constants.ts`.
- Um decorador de metadados é `MethodDecorator & ClassDecorator` construído com `SetMetadata`; um decorador de parâmetro usa `createParamDecorator`.
- Detalhes de implementação e semântica de acesso estão em `06-autenticacao-e-autorizacao.md`.
</regras>

## Correlação de requisição

<regras>
- Existe um único `AsyncLocalStorage` de contexto de requisição em `src/shared/observability/correlation.ts`. O logger, o filtro de exceção e o `ResilientClient` leem dele.
- `request.id` reutiliza um header `x-request-id` recebido válido; caso contrário, gera um UUID novo e devolve `x-request-id` no header da resposta.
- `ResilientClient` propaga `x-request-id` para serviços externos.
</regras>

## Logging

<exemplo>
```ts
this.logger.warn({ agentId, bestScore }, 'rerank.below_threshold');
```
</exemplo>

<regras>
- Use `nestjs-pino` / `Logger` do Nest. `console.*` é erro de lint.
- Primeiro argumento: objeto com campos estruturados em inglês. Segundo argumento: nome do evento na forma `noun.verb` em inglês. Não interpole valores dinâmicos na string da mensagem.
- Não passe `correlationId` manualmente nos logs (o pino já o injeta via contexto).
- Nunca registre em log tokens, o header `Authorization`, cookies, senhas, segredos, payloads completos de integrações ou dados pessoais (telefone, e-mail). O mascaramento (redaction) de headers de autenticação é configurado em `AppLoggerModule`.
- Rotas de health check não geram log de requisição.
</regras>

## Health checks

<regras>
- Três rotas públicas decoradas com `@Public()` em `src/shared/http/health/`:
  - `GET /health/startup`: responde `503` enquanto houver migrations pendentes no banco; `200` quando todas estiverem aplicadas.
  - `GET /health/live`: verifica apenas o processo Node; nunca consulta o banco de dados.
  - `GET /health/ready`: verifica banco de dados, memória e o estado de cada integração externa (`READY | NOT_CONFIGURED | MOCK`) vindo de `src/infrastructure/infrastructure.health.ts`. Uma integração `NOT_CONFIGURED` não derruba o readiness (`200`).
</regras>
