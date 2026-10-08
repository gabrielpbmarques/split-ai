---
trigger: always_on
---

# Authentication and authorization

Owns: the global guards, token verification, the authenticated principal, the permission catalog and how routes declare access.

This product is a **personal AI engine**: one deployment, a handful of users, no tenants. There is no organization, no per-tenant scope, no API key and no third-party token. That shapes every rule below.

<critical_rule>

- Every route is private by default. The only exemption is `@Public()`.
- No flag, environment variable or shortcut disables or bypasses authentication, including in tests. Tests sign real tokens with the pinned test `JWT_SECRET` (`test/support`).
- No controller uses `@UseGuards`.
- Token-format details (secret, algorithm, claim names) live only in `TokenVerifier`.

An auth shortcut created for tests ends up in production; token details outside the verifier spread every future change across the codebase.
</critical_rule>

## Deviation: this app issues its own tokens (PC-001)

The rule set describes a Resource Server behind an external IdP. Here the backend is the issuer: `POST /auth/login` (e-mail + password, bcrypt) calls `GenerateTokenService`, which signs an HS256 JWT with `env.JWT_SECRET` (`sub`, `name`, `email`, `phone`, `role`, `jti`). Verification stays concentrated in `TokenVerifier`.

## Structure

<structure>
```
src/auth/
  auth.module.ts                 registers the two APP_GUARDs (order matters)
  auth.constants.ts              metadata keys
  authentication.guard.ts        Bearer token → request.user
  authorization.guard.ts         @RequirePermissions metadata vs. request.user.permissions
  token.verifier.ts              the only class that knows the token format
  principal-resolver.service.ts  token payload → AuthenticatedUser with effective permissions
  permissions.ts                 the permission catalog (grants by role)
  authenticated-user.ts          AuthenticatedUser
  request-user.ts                requireUser(request)
src/shared/decorators/
  public.decorator.ts  permissions.decorator.ts  user.decorator.ts
src/types/                       Fastify request augmentation (request.user)
```
</structure>

<rules>
- `APP_GUARD` order is fixed: `AuthenticationGuard` first, `AuthorizationGuard` second.
- `AuthenticationGuard` accepts only `Authorization: Bearer <jwt>`. A missing token or unsupported scheme → `UnauthorizedException`.
- `TokenVerifier.verify(token)` validates signature and expiry; any failure throws `UnauthorizedException`. Changing the token format changes only this class. No Passport, no library strategy.
- `PrincipalResolverService` turns the verified payload into `AuthenticatedUser` and attaches the effective permissions. It does no I/O.
- `request.user` is typed by augmentation in `src/types/`.
</rules>

## The authenticated user

<example>
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
</example>

`id` is always present (every principal is a real user), so handlers use `user.id` directly; there is no `requireUserId` / `requireOrganizationId`.

## Permission catalog

Permissions are **derived from the role** in `src/auth/permissions.ts`; there are no `roles`/`permissions` tables because a personal engine has no need for per-user grants (conscious deviation, see `CLAUDE.md`).

| Role    | Meaning           | Grants                                                                                                                                                                                 |
| ------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `admin` | the owner         | everything, including `agent.manage` and `user.manage`                                                                                                                                 |
| `user`  | trusted operator  | `agent.*` (except `agent.manage`), `agent-connection.manage`, `source.*`, `session.read`, `report.read`, `analytics.read`, `voice.synthesize`, `user.read`, `account.access`, `chat.*` |
| `guest` | chat-only account | `account.access`, `chat.ask`                                                                                                                                                           |

<rules>
- Permission key format: `<resource>.<action>`, typed as `Permission` so a typo fails to compile.
- Route authorization is by permission, never by role.
- `AuthorizationGuard` does no I/O: it compares metadata with `request.user.permissions`. Inside one `@RequirePermissions('A', 'B')` any one suffices (OR); between class-level and method-level decorators every level must be satisfied (AND).
- A new permission is a new key in `PERMISSION_GRANTS` with its grant function, plus its use on a route.
- `@Public()` is used only for health, the login route and webhooks that authenticate by signature, unless a requirement says otherwise.
</rules>

## Resource scope

The rule set's second authorization layer (`AccessScopeService`: "does the user have permission X **on this resource**?") is not implemented, because without tenants every staff member (`admin`/`user`) may act on every agent, source, session and report. Do not add inline ownership checks in services.

Reintroduce a scope service — called in the service after loading the resource, throwing `ForbiddenException` — only when a route starts exposing one user's resource to another non-staff user (for example, guests reading their own sessions). Record that decision in `docs/decisoes-de-dominio.md`.

## Decorators

<example>
```ts
// src/shared/decorators/public.decorator.ts
export const Public = (): MethodDecorator & ClassDecorator => SetMetadata(IS_PUBLIC_KEY, true);

// src/shared/decorators/permissions.decorator.ts
export const RequirePermissions = (...permissions: Permission[]): MethodDecorator & ClassDecorator =>
SetMetadata(REQUIRED_PERMISSIONS_KEY, permissions);

// src/shared/decorators/user.decorator.ts
export const User = createParamDecorator(
(field: keyof AuthenticatedUser | undefined, context: ExecutionContext) => {
const user = requireUser(context.switchToHttp().getRequest<FastifyRequest>());
return field ? user[field] : user;
},
);

```
</example>

Controllers import `User` as `AuthUser` and type the parameter `AuthenticatedUser`.
```
