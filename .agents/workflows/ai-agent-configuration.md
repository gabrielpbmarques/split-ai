---
name: ai-agent-configuration
description: 'Use for agent CRUD and configuration: create/update/list/get agents, system_prompt, tools array, response_format (schema), the agents table, and agent DTO fields. Scope: src/modules/agents/ + src/modules/agent-runtime/ + src/modules/tools/.'
---

## Persistence shape

One table managed by TypeORM entities + migrations (`synchronize: false`; see `.claude/rules/database.md`).

**`agents`** (`src/infrastructure/database/schema/agent.entity.ts`)

| Column             | Type              | Notes                                                               |
| ------------------ | ----------------- | ------------------------------------------------------------------- |
| `id`               | uuid              | PK                                                                  |
| `name`             | text not null     |                                                                     |
| `agent_identifier` | text nullable     | human-readable handle, accepted wherever an id is (dual-key lookup) |
| `model`            | text nullable     | falls back to `deepseek-chat-v3.2` or `env.AI_MODEL`                |
| `temperature`      | float default 0.4 |                                                                     |
| `with_history`     | bool default true | gates session / checkpointer history                                |
| `system_prompt`    | text not null     | single instructions text block rendered into the agent              |
| `tools`            | text[] not null   | array of enabled tool identifiers (default: `['vector_search']`)    |
| `response_format`  | jsonb nullable    | structured output schema definition                                 |
| `sites`            | text[] nullable   | crawl seed urls                                                     |
| `canvas_layout`    | jsonb nullable    | visual state of the agent-connections canvas                        |
| `user_id`          | uuid nullable     | who created it; not an ownership gate                               |

There is no organization or ownership scope: every `admin`/`user` can read and change every agent (`.claude/rules/auth.md`). The older `agents_instructions` table and external database connection fields (`database_tool`, `database_url`, `database_tables`, `database_sample_rows`) were completely removed.

## Use cases

| Route                | Use case          | Permission     | Notes                                                             |
| -------------------- | ----------------- | -------------- | ----------------------------------------------------------------- |
| `POST /agent/create` | `create-agent`    | `agent.write`  | creates agent directly via `AgentRepository.create`               |
| `GET /agent/list`    | `list-agents`     | `agent.read`   | paginated `{ id, agent_identifier, name, is_tool, is_principal }` |
| `GET /agent`         | `list-all-agents` | `agent.manage` | paginated listing for admin                                       |
| `GET /agent/:id`     | `get-agent`       | `agent.read`   | id or `agent_identifier`                                          |
| `PATCH /agent/:id`   | `update-agent`    | `agent.write`  | partial update via `AgentRepository.update`                       |

Each route is its own use-case module (one controller, one `handle()`); there is no multi-route controller in this domain.

## CreateAgent

`CreateAgentService` inserts directly into `agents` via `AgentRepository.create`. Defaults: `model` `'deepseek-chat-v3.2'`, `temperature` 0.4, `withHistory` true, `tools` `['vector_search']`. `systemPrompt` is required on creation.

## UpdateAgent

`UpdateAgentService` builds a whitelist patch: only fields present in the DTO (`name`, `agentIdentifier`, `model`, `temperature`, `withHistory`, `sites`, `systemPrompt`, `responseFormat`) are written.

Lookup (`resolveAgent(idOrIdentifier)` in `GetAgent`/`UpdateAgent`, `AgentRepository.findByIdOrIdentifier` in `ResolveAgent`) checks UUID format first, then falls back to `agent_identifier`. Keep this dual-key pattern (`[[ai-agent-runtime]]`).

## Tools configuration (`tools`)

Tools are configured per agent as a string array `tools: string[]` on `AgentEntity`. `ToolLoaderService` maps enabled names to tools:

- `'vector_search'`: dense pgvector search over agent sources with Voyage embeddings and `rerank-2.5` cross-encoder.

## Structured output (`response_format`)

When an agent has `response_format`, it defines the structured output schema for the model response.

## Common pitfalls

- A new `AgentEntity` column does not appear in `GetAgent` output automatically: `AgentDetails` is built field by field.
- Do not reintroduce `agents_instructions` or `AIInstructions`: system prompts are a single text column `system_prompt` on `AgentEntity`.
