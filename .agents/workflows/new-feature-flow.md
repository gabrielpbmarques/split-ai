---
description: Use before implementing any new feature, endpoint, use case, table or integration in split-ai, and whenever a requester asks for a plan. Holds
---

# Implementing a new feature

<critical_rule>
Answer every question in Part 1, write the plan in the Part 2 format and present it to the requester before writing code. Then implement in the Part 3 order. When an answer depends on information missing from the request, ask the requester instead of assuming: a wrong assumption baked into a schema or an endpoint contract is expensive to undo.
</critical_rule>

Small fixes (a bug in one service, a copy change) do not need the full plan; one line describing the change is enough. Anything that adds an endpoint, a table, a column, an integration or a dependency does.

## Part 1 — Analyze the request

| #   | Question                                                                                                      | Consequence                                                                                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | What is the main goal, in one sentence?                                                                       | Defines what is in and out of scope.                                                                                                                              |
| 2   | Is there an equal or similar implementation (memory, existing modules and services)?                          | Reuse it. Never duplicate a service, repository, util or validation.                                                                                              |
| 3   | Is it system behavior (processing, background work), a user feature (endpoint), or both?                      | System: auxiliary use case (service + module, no controller/DTO). User: full HTTP use case. Both: separate the user action from the processing.                   |
| 4   | Does it need an external service?                                                                             | Follow `.claude/rules/integrations.md`.                                                                                                                           |
| 5   | Does it need a new library?                                                                                   | Install only if the current stack cannot do it and it does not duplicate an existing capability. Tell the requester before installing (`bun add`).                |
| 6   | Does it create a table, or add/remove/alter a column, index or constraint? Is there existing data to migrate? | Follow `.claude/rules/database.md`. Removing or altering a column requires finding every reader and writer first.                                                 |
| 7   | Does it involve new data? Which entities/types?                                                               | Entity in `schema/`; types in `src/shared/contracts/models/`.                                                                                                     |
| 8   | Which domain modules are involved? Do they exist?                                                             | New business noun → new domain. New action on an existing entity → use case in the existing domain.                                                               |
| 9   | Which use cases are involved? Do they exist?                                                                  | List each as `<verb>-<noun>`. Reuse an existing service by importing its module.                                                                                  |
| 10  | Does existing code change? Which files?                                                                       | List each file and the behavior change.                                                                                                                           |
| 11  | Who consumes what changes? Can it regress?                                                                    | Map consumers with `grep` (imports, routes, tables, ports) and cross-check with memory. Each affected consumer enters the plan with a test covering its behavior. |
| 12  | Which actions can the user take in the flow?                                                                  | Each user action = one HTTP use case.                                                                                                                             |
| 13  | For new endpoints: what do they receive and return?                                                           | Define method, route, input DTO, response shape and status before implementing.                                                                                   |
| 14  | Is each endpoint public or private? Which roles and permission?                                               | `@Public()` only with an explicit requirement. Pick the `@RequirePermissions` key from `src/auth/permissions.ts` (see `.claude/rules/auth.md`).                   |
| 15  | Does it need validation beyond the DTO (business rule, uniqueness, entity state)?                             | Format in the DTO; rules in the service.                                                                                                                          |
| 16  | Does any library involved have a registered issue?                                                            | Check `docs/problemas-conhecidos.md` (see the `known-problems` skill).                                                                                            |
| 17  | Is there a performance risk?                                                                                  | Go through the performance checklist.                                                                                                                             |
| 18  | Is there a security risk?                                                                                     | Go through the security checklist.                                                                                                                                |

<checklist title="Performance">
- [ ] No query inside a loop (N+1); use a join or a batch query.
- [ ] Every listing is paginated (`PaginationDto`, `limit` ≤ 100).
- [ ] Columns used in filters, ordering and joins are indexed.
- [ ] Transactions contain only database operations and are short.
- [ ] External calls have a timeout and circuit breaker and never run inside a transaction.
- [ ] Slow processing does not block the request (ingestion, crawling).
- [ ] Input arrays have a maximum size in the DTO.
- [ ] LLM and Voyage calls are bounded (Voyage without a payment method allows 3 RPM, PC-007).
</checklist>

<checklist title="Security">
- [ ] Route protected by a permission; `@Public()` only with an explicit requirement.
- [ ] Every input validated by a DTO (the global pipe rejects unknown fields).
- [ ] Response without sensitive or internal fields (`password_hash`, tokens, `database_url`).
- [ ] No sensitive data in logs.
- [ ] External calls through the integration layer; hand-written HTTP through `ResilientClient` with the host allowlisted.
- [ ] Secrets and URLs in `env.ts`, never in code.
- [ ] The actor's id comes from `@AuthUser()`, never from the body.
- [ ] SQL reaching an external database passes through `sql-guard.ts`.
</checklist>

## Part 2 — Implementation plan

<rules>
- Every plan follows the structure below, in order, with every section. An empty section says "Não se aplica."
- The plan is read by developers who may implement it by hand: write in topics, in logical language, in Portuguese.
- No code in the plan. Describe what to do, not how to type it.
- A service flow is a numbered list of logical steps. An altered flow shows the current step and the new one.
- Each endpoint gets its own subsection.
</rules>

<structure>
```markdown
# Plano: <título curto da demanda>

## 1. Objetivo

<uma frase; o que está fora do escopo>

## 2. Contexto

- Implementações anteriores relacionadas (memória, módulos existentes)
- O que será reutilizado

## 3. Banco de dados

- Tabelas novas: nome, colunas, tipos, nulidade, índices, constraints
- Tabelas alteradas: coluna adicionada, removida ou alterada, e o motivo
- Migração de dado existente
- Ou: "Não se aplica."

## 4. Endpoints

### <MÉTODO> <rota>

- Caso de uso: `<verbo>-<substantivo>`, novo ou existente
- Visibilidade: público ou privado
- Papéis: <papéis que podem chamar>
- Permissão: `<chave de @RequirePermissions>`
- DTO de entrada: campo, tipo, obrigatório, validação
- Resposta: status e campos retornados
- Erros: status e condição de cada um

## 5. Validações novas

- Validação, camada (DTO ou service) e erro retornado

## 6. Fluxo lógico do service

### <NomeService> (novo | alterado)

1. <passo lógico>
2. <passo lógico>

- Alteração: passo atual → passo novo

## 7. Artefatos

| Ação                      | Tipo                                                                           | Caminho   |
| ------------------------- | ------------------------------------------------------------------------------ | --------- |
| criar / alterar / remover | módulo, controller, service, dto, repositório, entidade, migration, integração | `src/...` |

## 8. Impacto e regressão

- Consumidores do código alterado e efeito esperado em cada um
- Testes existentes afetados
- Testes novos

## 9. Riscos e dúvidas em aberto

- Perguntas pendentes ao solicitante
- Travas conhecidas aplicáveis (`PC-NNN`)

```
</structure>

## Part 3 — Implementation order

<structure>
```

1. Database entity in schema/ + barrel/ENTITIES → db:generate against a production mirror → review → register in MIGRATIONS
2. Types src/shared/contracts/models/<name>.model.ts
3. Modules repository + repository module; <domain>.module.ts (new domain) + registration in AppModule
4. Use cases for each one: dto → service → controller → module → registration in the domain aggregator
5. Tests e2e per use case in test/<domain>.e2e-spec.ts; unit spec for pure functions
6. Verification format:check, lint, typecheck, test, test:e2e, build, di:verify, di:boot-check

```
</structure>

<rules>
- An external integration (port, contract, mapper, live gateway, mock) is implemented between steps 2 and 3.
- A new environment variable goes into `env.ts` and `.env.example` before the code that uses it.
- Order between use cases: create → get/list → update → delete.
- An auxiliary use case is implemented before the use case that consumes it.
</rules>

## Part 4 — Closing checklist

This is also the checklist in `.github/pull_request_template.md`.

<checklist>
- [ ] The 18 questions were answered and the plan was presented before the code.
- [ ] Consumers of the changed code were mapped and are covered by tests.
- [ ] Each use case has its own folder with a single `handle()` and `execute()`, registered in `imports` and `exports` of the domain aggregator.
- [ ] Business rules only in services; queries only in repositories, `tx?: Executor` last on writes.
- [ ] No import of another domain's internal file; no write to another domain's table; no `forwardRef`.
- [ ] No new abstraction or dependency without a current need.
- [ ] Changed entities have a generated, reviewed and committed migration (`bun run db:check`).
- [ ] No comment, `console.*`, `any` outside specs, or `process.env` outside `env.ts`.
- [ ] Verification commands ran without errors.
- [ ] Every issue investigated during the task is registered in `docs/problemas-conhecidos.md`, solved or not.
</checklist>
```
