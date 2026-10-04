---
name: ai-agent-configuration
description: 'Use for agent CRUD and configuration: create/update/list/delete agents, the AIInstructions shape, prompt construction (NormalizePromptInstructions, BuildSystemPrompt), parser schemas, the agents / agents_instructions tables, and agent DTO fields. Scope: src/modules/ArtificialIntelligence/.'
---

## Persistence shape

Two tables, both managed by TypeORM with `synchronize: true` (so entity changes alter prod schema — see top-level `CLAUDE.md`).

**`agents`** (`src/infrastructure/database/schema/agent.entity.ts`)

| Column                              | Type                  | Notes                                         |
| ----------------------------------- | --------------------- | --------------------------------------------- |
| `id`                                | uuid                  | PK                                            |
| `name`                              | text not null         |                                               |
| `agent_identifier`                  | text nullable         | human-readable handle, used as alt lookup     |
| `model`                             | text nullable         | falls back to `config.aiModel`                |
| `temperature`                       | float default 0.4     |                                               |
| `with_history`                      | bool default true     | gates checkpointer                            |
| `parser_schema`                     | jsonb nullable        | drives parser tool                            |
| `parser_name`, `parser_description` | text nullable         |                                               |
| `vector_search_tool`                | bool default **true** | DB default differs from DTO default           |
| `database_tool`                     | bool default **true** | DB default differs from DTO default           |
| `sites`                             | text[] nullable       | crawl seed urls                               |
| `user_id`, `organization_id`        | uuid nullable         | `organization_id = null` → admin/global agent |

**`agents_instructions`** (`src/infrastructure/database/schema/agent-instruction.entity.ts`) — versioned. `instructions: jsonb`, related back to agent. Use `findLatestByAgentId(agentId)` to get the active version. Updating instructions creates a new row (verify in `agentInstructionRepository`).

## AIInstructions shape — src/shared/contracts/models/ai-instructions.model.ts

```ts
type AIInstructions = {
  context: string;
  diretrizes?: string[];
  objetivo: string;
};
```

Field names mix English (`context`) and Portuguese (`diretrizes`, `objetivo`). **Keep this exact spelling** — `NormalizePromptInstructions` reads these literal keys. See the bug call-out below.

## Use cases

| Path                           | Method                           | Handler                       | Auth                                    | Notes                               |
| ------------------------------ | -------------------------------- | ----------------------------- | --------------------------------------- | ----------------------------------- |
| `POST /agent/create`           | `CreateAgentController.execute`  | `CreateAgentService`          | `agent.write`                           | staff (admin/user)                  |
| `POST /agent/create-attendant` | `CreateAttendantAgentController` | `CreateAttendantAgentService` | (see file)                              | admin can scope to any org          |
| `GET /agent/list`              | `ListAgentsController.handle`    | `ListAgentsService`           | `agent.read`                            | scoped to user's org for non-admins |
| `GET /agent`                   | `UpdateAgentController.list`     | `UpdateAgentService.list`     | `agent.manage`                          | admin-wide list with full payload   |
| `GET /agent/:id`               | `UpdateAgentController.getOne`   | `UpdateAgentService.getOne`   | `agent.read` + org scope                |                                     |
| `PATCH /agent/:id`             | `UpdateAgentController.update`   | `UpdateAgentService.update`   | `agent.write` + org scope               | partial update                      |

## CreateAgent vs CreateAttendantAgent

Both insert into `agents` + `agents_instructions`. The differences matter:

|                                        | `CreateAgentService`                                                  | `CreateAttendantAgentService`                                         |
| -------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Model default                          | `'claude-haiku-4-5-20251001'` (hard-coded)                            | `null` (falls back to `config.aiModel` at runtime)                    |
| `database_tool` / `vector_search_tool` | not set explicitly → DB defaults apply (`true`)                       | takes from DTO, defaults `false`                                      |
| `organization_id`                      | admin → `null`, others → `user.organization_id` (no override allowed) | admin → `dto.organizationId ?? null`, others → `user.organization_id` |
| Instructions                           | raw DTO `instructions`                                                | merged with hard-coded defaults (see below)                           |
| `sites`                                | passes through to entity but not via this service                     | passed through                                                        |

The `database_tool`/`vector_search_tool` discrepancy is real: regular `CreateAgent` callers cannot disable these tools — they always end up `true` because the column default fires. If you need a tools-off agent through that endpoint, extend the DTO + service.

### Attendant default instructions — src/modules/agents/create-attendant-agent/create-attendant-agent.service.ts:54-81

`CreateAttendantAgentService` prepends three blocks before saving:

- `getDefaultAttendantDirectives()` — six `IMPORTANTE: ...` rules covering `execute_sql` usage, tenant isolation, prompt-injection resistance, and `VRS` usage.
- `getDefaultContext()` — "assistente virtual de atendimento ao cliente" boilerplate.
- `getDefaultObjective()` — retention/upsell-oriented goals.

User-supplied `dto.instructions.diretrizes` are **appended** to the defaults (defaults run first). If you re-order this, you change attendant behavior across all newly-created agents.

### ⚠️ `contexto` vs `context` field-name mismatch

`create-attendant-agent.service.ts:38` stores the instruction object as:

```ts
const instructions = {
  contexto: defaultContext.join('\n'),   // <-- Portuguese key
  objetivo: defaultObjective.join('\n'),
  diretrizes: [...],
};
```

But `NormalizePromptInstructions` (`src/modules/agent-runtime/normalize-prompt-instructions/normalize-prompt-instructions.service.ts:23`) reads `instructions.context` (English). For attendant agents created today, the `CTX:` section of the rendered prompt is therefore `undefined`. When you touch this code, **decide on one spelling** (the type says `context`) and migrate stored rows, or extend the normalizer to accept both. Don't propagate `contexto` further.

## UpdateAgent — a multi-endpoint exception

`src/modules/agents/update-agent/update-agent.controller.ts` mounts three routes (`GET /agent`, `GET /agent/:id`, `PATCH /agent/:id`) backed by three public methods on `UpdateAgentService` (`update`, `getOne`, `list`). This **violates the "one use case = one module = one controller = one endpoint" hard rule** from the architecture skill, but is the current state. Two consequences when extending:

- Routes for admin-list / admin-getOne live here, while `ListAgentsService` handles the org-scoped list at `GET /agent/list`. Two list endpoints with different scopes is intentional. Don't merge them.
- `UpdateAgentService.update` accepts both `organizationId` (camelCase) and `organization_id` (snake_case) for admin moves between orgs. Preserve this if you refactor the DTO.

Lookup helper `resolveAgent(idOrIdentifier)` checks UUID format with a regex before trying `findById`, then falls back to `findByIdentifier`. Same dual-key pattern as `ResolveAgentService` (`[[ai-agent-runtime]]`).

## Prompt construction chain

### NormalizePromptInstructions — src/modules/agent-runtime/normalize-prompt-instructions/normalize-prompt-instructions.service.ts

Renders the instruction object + tool list + caller-supplied variables into a single text block:

```
OBJ = Objetivo | CTX = Contexto | DIR = Diretrizes | VRS=variáveis | CTX=contexto | MEM=memória curta | TOOLS=ferramentas | OUT=saída

OBJ: <instructions.objetivo>
CTX: <instructions.context>          <-- reads `context`, see bug above
VRS:
<key>: <value>
DIR:
- <each item in instructions.diretrizes>
TOOLS:
Name: <tool.name>
Description: <tool.description>
```

The legend line (`OBJ = ... | OUT=saída`) is a fixed header. If you redesign the prompt format, update both the legend and the body sections.

### BuildSystemPrompt — src/modules/agent-runtime/build-system-prompt/build-system-prompt.service.ts

Thin wrapper: calls `NormalizePromptInstructionsService.execute(...)` and appends `\nTODAY_DATE: ${new Date().toLocaleDateString()}`. The date is computed at agent-resolve time (so it's "now" relative to the request, not the deploy). Locale follows the server's runtime locale — in Cloud Run this is typically `en-US`, so dates render as `M/D/YYYY`. If a prompt needs `dd/MM/yyyy`, format explicitly.

## Parser tool (`parser_schema`)

When an agent has `parser_schema` set, `ResolveAgent` builds a tool from it via `buildLangchainToolFromSchema(parser_name, parser_description, parser_schema)` (`src/shared/utils/buildZodSchema.ts`). The function compiles a custom schema DSL — `{ type: 'string' | 'number' | 'boolean' | 'object' | 'array', properties, items, enum, optional, default, description }` — into a Zod schema, then wraps it as a `DynamicStructuredTool` whose `func` is `async () => {}`. The tool exists only to advertise its schema to the model — its return value is empty. Useful when you want the agent to produce a structured payload as one of its tool calls without actually executing anything server-side.

## Common pitfalls

- Adding a new column to `AgentEntity` does not automatically expose it on `UpdateAgentService.getOne/list` output. Extend the response object explicitly — the spread is whitelist-style, not pass-through.
- Touching `agents_instructions` schema: existing rows store `instructions: jsonb` with the inconsistent shape described above; a strict migration will fail. Normalize first.
- `CreateAttendantAgentDto.instructions` is typed as `AIInstructions` but `@IsOptional` on `instructions: ... = required by code path` — the service reads `dto.instructions.diretrizes` unconditionally and will crash if `instructions` is absent. Tighten the validator if you have time.
- Admins set `organization_id = null` (intentional — global agents). Code that filters by org must `IS NULL` to surface them or it'll hide built-ins.
