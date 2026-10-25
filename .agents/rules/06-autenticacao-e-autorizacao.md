---
trigger: glob
description: 'Autenticação e autorização: guards globais, TokenVerifier, AuthenticatedUser, catálogo de permissões por papel e ausência de escopo de recurso.'
globs: 'src/auth/**, src/modules/auth-flows/**, src/shared/decorators/**, src/types/**'
---

# Autenticação e autorização

Cobre: os guards globais, a verificação de token, o usuário autenticado (`AuthenticatedUser`), o catálogo de permissões e como as rotas declaram controle de acesso.

Este produto é um **motor pessoal de IA**: um único deploy, poucos usuários e nenhum tenant. Não há organizações, escopo por tenant, chaves de API nem tokens de terceiros. Isso molda todas as regras abaixo.

<regra critica="true">
- Toda rota é privada por padrão. A única isenção permitida é `@Public()`.
- Nenhuma flag, variável de ambiente ou atalho desativa ou contorna a autenticação, **inclusive em testes**. Os testes assinam tokens reais com o `JWT_SECRET` fixado de teste (`test/support/`).
- Nenhum controller usa `@UseGuards`.
- Detalhes do formato do token (segredo, algoritmo, nomes de claims) vivem exclusivamente em `TokenVerifier`.

Um atalho de autenticação criado para testes acaba vazando para produção; detalhes do token espalhados fora do verificador multiplicam o impacto de qualquer mudança futura.
</regra>

## Desvio consciente: esta aplicação emite os próprios tokens (PC-001)

A especificação base descreve um Resource Server atrás de um IdP externo. Aqui, o próprio backend é o emissor: `POST /auth/login` (e-mail + senha com `bcrypt`) chama `GenerateTokenService`, que assina um JWT HS256 com `env.JWT_SECRET` contendo `sub`, `name`, `email`, `phone`, `role` e `jti`. A verificação permanece concentrada em `TokenVerifier`.

## Estrutura

<estrutura>
```
src/auth/
  auth.module.ts                 Registra os dois APP_GUARDs (a ordem importa)
  auth.constants.ts              Chaves de metadados (IS_PUBLIC_KEY, REQUIRED_PERMISSIONS_KEY)
  authentication.guard.ts        Bearer token → request.user
  authorization.guard.ts         Metadados @RequirePermissions vs. request.user.permissions
  token.verifier.ts              A única classe que conhece o formato do token JWT
  principal-resolver.service.ts  Payload verificado → AuthenticatedUser com permissões efetivas
  permissions.ts                 Catálogo de permissões (concessões por role)
  authenticated-user.ts          Interface AuthenticatedUser
  request-user.ts                requireUser(request)
src/shared/decorators/
  public.decorator.ts            @Public()
  permissions.decorator.ts       @RequirePermissions()
  user.decorator.ts              @User() (importado como AuthUser)
src/types/                       Augmentation do FastifyRequest (request.user)
```
</estrutura>

<regras>
- A ordem dos `APP_GUARD`s é fixa: `AuthenticationGuard` primeiro, `AuthorizationGuard` segundo.
- `AuthenticationGuard` aceita apenas `Authorization: Bearer <jwt>`. Token ausente ou esquema não suportado → `UnauthorizedException`.
- `TokenVerifier.verify(token)` valida assinatura e expiração; qualquer falha lança `UnauthorizedException`. Alterar o formato do token altera apenas esta classe. Sem Passport e sem estratégias de biblioteca externa.
- `PrincipalResolverService` transforma o payload verificado em `AuthenticatedUser` e anexa as permissões efetivas. Ele não faz I/O.
- `request.user` é tipado via module augmentation em `src/types/`.
</regras>

## O usuário autenticado (`AuthenticatedUser`)

<exemplo>
```ts
export interface AuthenticatedUser {
  readonly id: string;
  readonly name: string | null;
  readonly email: string | null;
  readonly phone: string | null;
  readonly role: UserRole;
  readonly permissions: readonly Permission[];
}
```
</exemplo>

`id` está sempre presente (todo principal é um usuário real), portanto os handlers e services usam `user.id` diretamente; não existem helpers como `requireUserId` ou `requireOrganizationId`.

## Catálogo de permissões (`src/auth/permissions.ts`)

As permissões são **derivadas do papel (`role`)** em `src/auth/permissions.ts`; não há tabelas `roles` ou `permissions` no banco porque um motor pessoal não precisa de concessões individuais por usuário (`00-projeto.md`).

<tabela>

| Papel (`UserRole`) | Significado              | Permissões concedidas (`PERMISSION_GRANTS`)                                                                                                                                                           |
| ------------------ | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `admin`            | Proprietário             | Todas as permissões, incluindo `agent.manage` e `user.manage`                                                                                                                                         |
| `user`             | Operador de confiança    | `agent.read`, `agent.write`, `agent-connection.manage`, `source.read`, `source.write`, `session.read`, `report.read`, `analytics.read`, `voice.synthesize`, `user.read`, `account.access`, `chat.ask` |
| `guest`            | Conta apenas de conversa | `account.access`, `chat.ask`                                                                                                                                                                          |

</tabela>

<regras>
- Formato da chave de permissão: `<resource>.<action>` em inglês, tipado como `Permission` para que erros de digitação falhem na compilação.
- A autorização de rota é sempre por permissão (`@RequirePermissions`), nunca por papel (`role`).
- `AuthorizationGuard` não faz I/O: compara os metadados da rota com `request.user.permissions`. Dentro de um único `@RequirePermissions('A', 'B')`, basta possuir qualquer uma das permissões (OR); entre o decorador da classe e o decorador do método, ambos os níveis precisam ser satisfeitos (AND).
- Criar uma nova permissão exige adicionar a chave em `PERMISSION_GRANTS` (`src/auth/permissions.ts`) com sua função de concessão e aplicá-la na rota.
- `@Public()` é usado apenas para rotas de health check (`/health/*`), login (`POST /auth/login`) e webhooks que autenticam por assinatura ou origem (como `POST /whatsapp/webhook`), a menos que um requisito explícito diga o contrário.
</regras>

## Escopo de recurso

A segunda camada de autorização da especificação base (`AccessScopeService`: "o usuário tem a permissão X **sobre este recurso específico**?") não é implementada neste projeto, pois sem tenants todo membro da equipe (`admin` e `user`) pode atuar sobre qualquer agente, conexão, fonte ou sessão. `user_id` em `agents` registra apenas quem criou o agente. Não adicione checagens inline de propriedade (`owner`) nos services.

Reintroduza um serviço de escopo — chamado no service após carregar o recurso e lançando `ForbiddenException` — somente quando uma rota passar a expor o recurso de um usuário para outro usuário não-staff (por exemplo, usuários `guest` lendo suas próprias sessões).

## Decoradores

<exemplo>
```ts
export const Public = (): MethodDecorator & ClassDecorator => SetMetadata(IS_PUBLIC_KEY, true);

export const RequirePermissions = (
...permissions: Permission[]
): MethodDecorator & ClassDecorator => SetMetadata(REQUIRED_PERMISSIONS_KEY, permissions);

export const User = createParamDecorator(
(field: keyof AuthenticatedUser | undefined, context: ExecutionContext) => {
const user = requireUser(context.switchToHttp().getRequest<FastifyRequest>());
return field ? user[field] : user;
},
);

```
</exemplo>

Os controllers importam `User` como `AuthUser` (`import { User as AuthUser } from 'src/shared/decorators/user.decorator'`) e tipam o parâmetro como `AuthenticatedUser`.
```
