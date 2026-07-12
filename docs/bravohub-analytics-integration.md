# BravoHub Analytics Assistant — company-scoped integration

How the BravoHub dashboard talks to the **Oracle Analytics** agent
(`a951e928-2b86-4737-8aee-88fde5eb27d6`, identifier `analytics-oracle`) and how a
tenant's data is isolated so the AI can **only ever read the logged company's
analytics**.

## End-to-end flow

```
Browser (dashboard, IA tab)
  │  POST /api/ask   (no auth header; httpOnly bh_token cookie rides along)
  ▼
Next route handler  bravohub-analytic-frontend/src/app/api/ask/route.ts
  │  Authorization: Bearer <bh_token>   → ANALYTICS_API_BASE_URL
  ▼
bravohub-api  POST /api/analytics/assistant/ask   (AuthGuard verifies JWT)
  │  Authorization: Bearer <bh_token>  (RELAYED)   → SPLIT_AI_BASE_URL
  │  body.variables.companyId = user.company_id    (defense-in-depth)
  ▼
split-ai  POST /support/question
  │  AuthGuard → verifyBravohubJwt(BRAVOHUB_JWT_SECRET) → trusted company_id
  │  QuestionService forces variables.companyId = <verified>  (overrides body)
  ▼
Oracle supervisor (a951e928) — no DB tool; delegates via connection tools
  │  scope threaded to the child (was previously dropped!)
  ▼
analytics-sql-analyst child — execute_sql (read-only + company_id = <scope>)
```

`company_id` is **never** taken from the request body — it is derived from the
cryptographically verified dashboard JWT at both hops and forced into the prompt
variables server-side.

## Company isolation — the layers (defense in depth)

1. **Verified scope, not client input.** split-ai verifies the forwarded dashboard
   JWT (HS512, `BRAVOHUB_JWT_SECRET`) and reads `company_id` from the `user`
   claim (`auth.guard.ts` → `verifyBravohubJwt`).
2. **Forced variable.** `QuestionService` overrides any client-supplied
   `variables.companyId` with the verified value before resolving the agent.
3. **Fail closed.** A request to a `bravohubScopedAgents` agent without a verified
   company scope is rejected (`ForbiddenException`) — a native JWT, API key, or a
   leaked embed token can never reach the shared DB.
4. **Scope reaches the SQL writer.** `ResolveAgent.invokeConnectedAgent` now
   passes the scope to the connected child (it previously passed `undefined`, so
   the agent that actually writes SQL saw no scope).
5. **Tool-layer enforcement.** For scoped agents `execute_sql` is **read-only**
   (SELECT only) and requires `company_id = <scope>`, rejecting a different
   value, `IN (...)`, ranges, and inequalities (`LoadDatabaseTool.assertScoped`).
6. **Prompt guardrail.** `BuildSystemPrompt` injects a non-negotiable, code-level
   tenant-isolation directive whenever a `companyId` scope is present — applied to
   both the supervisor and the SQL child, independent of DB-stored instructions.

## Required configuration

**split-ai** (`.env`):

| var                      | required | notes                                                                                                                                                                                                                   |
| ------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BRAVOHUB_JWT_SECRET`    | **yes**  | Must equal bravohub-api's `JWT_SECRET`. Without it every BravoHub token is rejected (401).                                                                                                                              |
| `BRAVOHUB_ORG_ID`        | optional | split-ai org UUID that owns the Oracle agent — used only to attribute sessions. Token usage is attributed via `agent.organization_id` regardless. Get it: `SELECT organization_id FROM agents WHERE id='a951e928-...';` |
| `BRAVOHUB_SCOPED_AGENTS` | optional | Defaults to the Oracle uuid + `analytics-oracle` + `analytics-sql-analyst`. Agents listed here require a verified company scope.                                                                                        |

The Oracle org must also have the `database_connection` feature enabled and a
`database_url` pointing at the BravoHub MySQL (unchanged — see the team-setup
runbook, Passo 7).

**bravohub-api** (`.env`): `SPLIT_AI_BASE_URL`, `SPLIT_AI_AGENT_IDENTIFIER`
(default `analytics-oracle`). `SPLIT_AI_CHAT_EMBED_TOKEN` is **no longer used** by
`assistant/ask` (it forwards the JWT now).

**frontend** (`.env`): `ANALYTICS_API_BASE_URL` (already present) — points at
bravohub-api.

## Files changed

- **split-ai:** `config.ts`, `auth/auth.guard.ts`, `AIChat/Question/question.service.ts`,
  `ArtificialIntelligence/ResolveAgent/resolve-agent.service.ts`,
  `ArtificialIntelligence/BuildSystemPrompt/build-system-prompt.service.ts`,
  `Tools/LoadDatabaseTool/load-database-tool.service.ts` (+ spec).
- **bravohub-api:** `Analytics/Assistant/AskQuestion/ask-question.{controller,service}.ts`
  (relay the JWT as Bearer).
- **frontend:** `components/TopTabs.tsx` (IA tab), `components/dashboards/ia/AssistantChat.tsx`
  (tool labels). The IA page, chat UI, and `/api/ask` proxy already existed.

## Residual risks & recommended follow-ups

- **Regex predicate is not a parser.** `assertScoped` requires `company_id = X`
  and blocks other-company literals/`IN`/ranges, but a crafted tautology
  (`... OR 1=1`) is not detected. The compensating controls are read-only mode,
  the server-forced scope, and the prompt guardrail. For an **"under no
  circumstances"** guarantee, isolate at the database: a **per-company read-only
  MySQL user / security-barrier views**, or replace raw SQL with **HTTP tools that
  call bravohub-api's `/api/analytics/*` endpoints** (company enforced by
  `CompanyScopeGuard`, and answers match the dashboard by construction).
- **Global-admin company switch not honored.** `@torors.com.br` admins who switch
  companies via the dashboard header still get their JWT's _home_ company in the
  AI (same as the pre-existing `assistant/ask` behavior). To support it: forward
  the active company from the frontend (`getActiveCompanyId`) and have bravohub
  mint a short-lived token whose `user.company_id` is the validated active company
  (split-ai keeps deriving scope from the verified token — no trust in a raw
  header).

## Testing

- Log in as a **regular client user** and open the **IA** tab. Ask
  "quantas vendas tivemos em maio?" — the answer must reflect only that company.
- Confirm cross-company refusal: "compare com a empresa X" must be declined.
- Unit coverage for the SQL guard: `pnpm jest load-database-tool`.
