---
name: ai-agent-configuration
description: 'Use for agent CRUD and configuration: create/update/list/get agents, the AIInstructions shape, prompt construction (NormalizePromptInstructions, BuildSystemPrompt), parser schemas, the per-agent database connection fields, the agents / agents_instructions tables, and agent DTO fields. Scope: src/modules/agents/ + src/modules/agent-runtime/ + src/modules/retrieval/.'
---

## Persistence shape

Two tables, both managed by TypeORM entities + migrations (`synchronize: false`; see `.claude/rules/database.md`).

**`agents`** (`src/infrastructure/database/schema/agent.entity.ts`)

| Column                              | Type                           | Notes                                                               |
| ----------------------------------- | ------------------------------ | ------------------------------------------------------------------- |
| `id`                                | uuid                           | PK                                                                  |
| `name`                              | text not null                  |                                                                     |
| `agent_identifier`                  | text nullable                  | human-readable handle, accepted wherever an id is (dual-key lookup) |
| `model`                             | text nullable                  | falls back to `env.AI_MODEL` in the `CHAT_MODEL` factory            |
| `temperature`                       | float default 0.4              |                                                                     |
| `with_history`                      | bool default true              | gates the `PostgresSaver` checkpointer                              |
| `parser_schema`                     | jsonb nullable                 | drives the parser tool                                              |
| `parser_name`, `parser_description` | text nullable                  |                                                                     |
| `vector_search_tool`                | bool default true              |                                                                     |
| `database_tool`                     | bool default true              | one of the two gates for `execute_sql`                              |
| `database_url`                      | text nullable, `select: false` | external DB; the other gate. Secret: never logged or returned       |
| `database_tables`                   | text[] nullable                | allow-list passed to the schema description                         |
| `database_sample_rows`              | int nullable                   | sample rows per table in the schema description                     |
| `sites`                             | text[] nullable                | crawl seed urls                                                     |
| `canvas_layout`                     | jsonb nullable                 | visual state of the agent-connections canvas                        |
| `user_id`                           | uuid nullable                  | who created it; not an ownership gate                               |

**`agents_instructions`** (`src/infrastructure/database/schema/agent-instruction.entity.ts`) — `instructions: jsonb`, one or more rows per agent. `findLatestByAgentId(agentId)` returns the active one; `updateLatestByAgentId` overwrites the latest row in place (it creates a row only when none exists).

There is no organization or ownership scope: every `admin`/`user` can read and change every agent (`.claude/rules/auth.md`).

## AIInstructions shape — src/shared/contracts/models/ai-instructions.model.ts

```ts
type AIInstructions = {
  context: string;
  diretrizes?: string[];
  objetivo: string;
};
```

Field names mix English (`context`) and Portuguese (`diretrizes`, `objetivo`). Keep this exact spelling: `NormalizePromptInstructions` reads these literal keys, and a renamed key renders as `undefined` in the prompt.

## Use cases

| Route                          | Use case                 | Permission     | Notes                                                             |
| ------------------------------ | ------------------------ | -------------- | ----------------------------------------------------------------- |
| `POST /agent/create`           | `create-agent`           | `agent.write`  | transaction: agent + first instructions row                       |
| `POST /agent/create/attendant` | `create-attendant-agent` | `agent.write`  | merges default attendant instructions                             |
| `GET /agent/list`              | `list-agents`            | `agent.read`   | paginated `{ id, agent_identifier, name, is_tool, is_principal }` |
| `GET /agent`                   | `list-all-agents`        | `agent.manage` | paginated, with latest instructions (admin)                       |
| `GET /agent/:id`               | `get-agent`              | `agent.read`   | id or `agent_identifier`; never returns `database_url`            |
| `PATCH /agent/:id`             | `update-agent`           | `agent.write`  | partial update, transaction with instructions                     |
| `POST /agent/load-sites`       | `load-agent-sites`       | `agent.manage` | crawls `sites` into the vector store                              |

Each route is its own use-case module (one controller, one `handle()`); there is no multi-route controller in this domain.

## CreateAgent vs CreateAttendantAgent

Both insert into `agents` + `agents_instructions`.

|                                        | `CreateAgentService`                                  | `CreateAttendantAgentService`                 |
| -------------------------------------- | ----------------------------------------------------- | --------------------------------------------- |
| Model default                          | `'claude-haiku-4-5-20251001'`                         | `null` (runtime falls back to `env.AI_MODEL`) |
| `database_tool` / `vector_search_tool` | DTO value, default `true`                             | DTO value, default `false`                    |
| Database connection                    | `databaseUrl`, `databaseTables`, `databaseSampleRows` | not accepted                                  |
| Instructions                           | raw DTO `instructions`                                | merged with hard-coded defaults (below)       |
| Transaction                            | yes (`TransactionExecutor`)                           | no                                            |

`vector_search_tool` must never be stored as `null`: the tool loader treats a falsy flag as "off", so `CreateAgentService` coalesces to the column default.

### Attendant default instructions — src/modules/agents/create-attendant-agent/create-attendant-agent.service.ts

`CreateAttendantAgentService` builds `{ context, objetivo, diretrizes }` from three private helpers:

- `getDefaultAttendantDirectives()` — `IMPORTANTE: ...` rules covering `execute_sql` usage, not exposing other users' data, prompt-injection resistance and `VRS` usage.
- `getDefaultContext()` — "assistente virtual especializado em atendimento ao cliente" boilerplate.
- `getDefaultObjective()` — retention/upsell-oriented goals.

User-supplied `dto.instructions.diretrizes` are appended after the defaults. Re-ordering changes the behavior of every attendant created afterwards. Older attendant rows may still carry a `contexto` key (an earlier bug); standardize on `context` if you touch them.

## UpdateAgent

`UpdateAgentService` builds a whitelist patch: only fields present in the DTO are written. `databaseUrl: null` clears the connection; an empty `databaseTables` array is stored as `null`. Instructions go through `updateLatestByAgentId` inside the same transaction.

Lookup (`resolveAgent(idOrIdentifier)` in `GetAgent`/`UpdateAgent`, `AgentRepository.findByIdOrIdentifier` in `ResolveAgent`) checks UUID format first, then falls back to `agent_identifier`. Keep this dual-key pattern (`[[ai-agent-runtime]]`).

## Per-agent database connection

`execute_sql` appears only when `database_tool = true` **and** `database_url` is set. The URL must start with `postgres://`, `postgresql://`, `mysql://` or `mysql2://` (DTO `@Matches`). Because the column is `select: false`, normal reads never load it; `MaybeLoadDatabaseToolService` reads it through `AgentRepository.findDatabaseConnection(id)`. Details in `[[ai-agent-tools-and-rag]]`.

## Prompt construction chain

### NormalizePromptInstructions — src/modules/agent-runtime/normalize-prompt-instructions/normalize-prompt-instructions.service.ts

Renders the instruction object, the caller's prompt variables and the tool list into one text block:

```
OBJ = Objetivo | CTX = Contexto | DIR = Diretrizes | VRS=variáveis | CTX=contexto | MEM=memória curta | TOOLS=ferramentas | OUT=saída

OBJ: <instructions.objetivo>
CTX: <instructions.context>
VRS:
<key>: <value>
DIR:
- <each item in instructions.diretrizes>
TOOLS:
Name: <tool.name>
Description: <tool.description>
```

The legend line is a fixed header; if you redesign the format, update the legend and the body together.

### BuildSystemPrompt — src/modules/agent-runtime/build-system-prompt/build-system-prompt.service.ts

Thin wrapper: calls `NormalizePromptInstructionsService.execute(...)` and appends `TODAY_DATE: ${new Date().toLocaleDateString()}`, computed at resolve time. The locale follows the server runtime (Cloud Run is typically `en-US`, `M/D/YYYY`); format explicitly if a prompt needs `dd/MM/yyyy`.

## Parser tool (`parser_schema`)

When an agent has `parser_schema`, `LoadAgentToolsService` builds a tool with `buildLangchainToolFromSchema(parser_name, parser_description, parser_schema)` (`src/shared/utils/build-zod-schema.ts`). It compiles a small schema DSL — `{ type: 'string' | 'number' | 'boolean' | 'object' | 'array', properties, items, enum, optional, default, description }` — into Zod and wraps it in a tool whose `func` is a no-op. The tool only advertises its schema so the model can emit a structured payload.

## Common pitfalls

- A new `AgentEntity` column does not appear in `GetAgent` output automatically: `AgentDetails` is built field by field. Never add `database_url` to it.
- Existing `agents_instructions` rows may have inconsistent shapes (`contexto`); normalize before a strict migration.
- `instructions.diretrizes` should be a non-empty array; the attendant service reads `dto.instructions.diretrizes` and the DTO marks `instructions` optional, so a missing object crashes there.
