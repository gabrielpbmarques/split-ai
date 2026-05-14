---
name: ai-agent-tools-and-rag
description: 'Use when: adding or modifying LangChain tools available to an agent (vector search, SQL execution, parser); changing pgvector / Supabase similarity search behavior; ingesting new sources via Spider; touching the SQL guardrails in LoadDatabaseTool; or working with embeddings, the documents table, or VertexAI embedding configuration.'
---

## Three tools an agent can carry

`ResolveAgent.loadTools(dbAgent)` (`src/components/ArtificialIntelligence/ResolveAgent/resolve-agent.service.ts:115-141`) reads three columns on `agents` and appends a tool for each:

| Flag / column                     | Tool                                       | Built by                                                        |
| --------------------------------- | ------------------------------------------ | --------------------------------------------------------------- |
| `parser_schema` (jsonb, presence) | dynamic parser (no-op `func`, schema-only) | `buildLangchainToolFromSchema` in `src/utils/buildZodSchema.ts` |
| `vector_search_tool` (bool)       | `vector_similarity_search`                 | `LoadVectorSearchToolService.execute()`                         |
| `database_tool` (bool)            | `execute_sql`                              | `LoadDatabaseToolService.execute(organizationId)`               |

Tools are returned as `DynamicStructuredTool<z.ZodObject<any>>[]` and threaded into `createAgent({ tools, ... })`. The same `tools` array is also rendered into the system prompt by `NormalizePromptInstructions` (`Name: ... / Description: ...`), so a model sees both the tool descriptors **and** a textual list.

## Parser tool — src/utils/buildZodSchema.ts

```ts
buildLangchainToolFromSchema(name, description, schemaDef): DynamicStructuredTool
```

- `schemaDef` is a custom JSON DSL (`type`, `optional`, `enum`, `default`, `description`, nested `properties`, array `items`) — compiled into a Zod schema by `buildZodSchema`.
- The tool's `func` is `async () => {}` — invocation returns `undefined`. This is by design: the parser tool exists only so the model can emit a structured argument matching the schema. Use it when you want the agent to produce JSON in a specific shape during reasoning. **Do not** add side-effects here without first changing the contract — many call sites assume parser tools are inert.

## Vector search tool — src/components/ArtificialIntelligence/LoadVectorSearchTool/load-vector-search-tool.service.ts

```ts
new DynamicStructuredTool({
  name: 'vector_similarity_search',
  description: 'IMPORTANTE: SEMPRE use esta ferramenta antes de responder. ...',
  schema: z.object({ query: z.string(), agent_id: z.string() }),
  func: async ({ query, agent_id }) => {
    const store = await loadVectorStoreService.execute({ agent_id });
    const docs = await executeSimilaritySearchService.execute(store, query);
    return docs.map((d) => d.pageContent).join(' ');
  },
});
```

- The description prompts the model to **always** call this tool first when the flag is on. Removing that line will shift agent behavior toward not retrieving — make the change deliberate.
- The tool returns `pageContent` joined by a single space. Sources/scores are dropped; if you need citations, return a structured payload and update consumers (today there are none beyond the LLM).
- `agent_id` is **filled by the model** based on the system-prompt template (which interpolates `{agentId}`). Make sure that prompt variable is set in any caller (it is for chat flows — see `[[ai-agent-runtime]]`).

## Database tool — src/components/ArtificialIntelligence/LoadDatabaseTool/load-database-tool.service.ts

A SQL-execution tool with **heavy guardrails**. Bound to a single `organization_id` at load time, so each request that hits the agent gets a freshly-scoped tool.

### Setup (on module init)

- Opens a second `DataSource` against `config.databaseUrl` (separate from the global TypeORM connection — keep that in mind if you adjust pool sizing).
- Introspects schema with `SqlDatabase.fromDataSourceParams` and `getTableInfo(['reports', 'users'])`. **Only those two tables are exposed to the model.** Adding tables means editing this list and shipping a prompt update (the schema is embedded in the tool description).

### Execution (`executeSql.func`)

1. `sanitizeSqlQuery(query, organizationId)` — see rules below.
2. Calls `universalDataRepository.execute(q)` — raw SQL execution.
3. Returns a JSON-stringified result (or string if already a string).

### Guardrails in `sanitizeSqlQuery`

- **Single statement only.** More than one `;` (or a stray statement after a trailing semicolon) throws `'multiple statements are not allowed.'`.
- **Tenant gate.** Throws unless the query literally contains the agent's `organizationId` as a substring. This is a string check, not a parse — be aware that an injection attempt embedding the org id elsewhere would pass; the tool description tells the model to use `WHERE organization_id = '<uuid>'`, but defense-in-depth here is informal.
- **Verb allow-list.** Must start with `select`, `insert`, or `update` (case-insensitive). Everything else throws.
- **Deny regex.** `\b(DELETE|ALTER|DROP|CREATE|REPLACE|TRUNCATE)\b` — caught even if the query starts with an allowed verb (defense against multi-keyword payloads).
- **LIMIT cap.** If the query does not end with `LIMIT n[, m]` the tool appends ` LIMIT 5`. Small. If the model needs more rows, it must specify its own LIMIT.

### Description prompt

The tool's `description` is a small system prompt: schema, "REGRAS DE OURO" for UUID casting (`gen_random_uuid()`, `'...'::uuid`), enum syntax (`'value'::enum_name`), `NOW()` for `created_at`/`updated_at`, a hard-coded `WHERE organization_id = '<orgId>'` mandate, an SQL-error retry loop (up to 3 attempts), and column-listing preference over `SELECT *`. Change the description and you change the model's SQL style.

### Common edits

- **Expose another table.** Add it to the `getTableInfo([...])` list and consider updating any "golden rules" that reference it.
- **Loosen LIMIT.** Move the regex append into the description as a recommendation, not a forced suffix — but then expect occasional unbounded queries.
- **Tighten tenant check.** Replace the substring check with a parsed-AST check (use `pg-query-emscripten` or similar) before any prod expansion of which agents get this tool.

## Vector store layer

### LoadVectorStore — src/components/ArtificialIntelligence/LoadVectorStore/load-vector-store.service.ts

```ts
SupabaseVectorStore.fromExistingIndex(embeddings, {
  client: supabaseClient,
  tableName: 'documents', // default
  queryName: `match_${tableName}`, // e.g. match_documents
  filter, // CustomMetadata
});
```

- Default table is `documents`; the matching Postgres function is `match_documents`. A second table would need its own SQL function with the same signature.
- `filter` is a `CustomMetadata` object (`{ session_id?, user_id?, agent_id?, source_type?, source_id?, organization_id? }`) — pgvector scopes vectors by this metadata. The vector-search-tool above passes `{ agent_id }`, so chunks ingested without `agent_id` are invisible to chat.
- `embeddings` is `VertexAIEmbeddings` provided via `VERTEX_AI_EMBEDDINGS` token from `src/infrastructure/providers/vertex-ai.provider.ts`. Don't `new` it inline — DI it.

### ExecuteSimilaritySearch — src/components/ArtificialIntelligence/ExecuteSimilaritySearch/execute-similarity-search.service.ts

```ts
const topK = 10;
const queryEmbeddings = await this.embeddings.embedQuery(question);
const similarDocs = await vectorStore.similaritySearchVectorWithScore(
  queryEmbeddings,
  topK,
);
return similarDocs.flatMap((val) => val[0]); // drops scores
```

- `topK` is hard-coded `10`. Tune in one place if you change retrieval breadth.
- Embeds the query separately (via `VertexAIEmbeddings.embedQuery`) and passes the precomputed vector to the search. This is intentional — you can reuse the embedding if you need to log it.
- Returns `Document[]` without scores. Add structured returns if you need source ranking downstream.

## Site ingestion — src/components/ArtificialIntelligence/LoadAgentSites/load-agent-sites.service.ts

Endpoint `POST /agent/load-sites` (admin-only). Body: `{ sites: string, agentId: string }`.

1. `spiderService.crawl(sites, { limit: 20, depth: 25, metadata: true, readability: true, return_format: 'text' })` — third-party crawler at `spider.cloud`.
2. `supabaseService.createVectorStore(docs, { source_type: 'site', agent_id, source_id })` — chunks and embeds into the `documents` table, tagged with `source_type: 'site'` so the vector search tool can retrieve them under that agent.

Returns the chunk count. Failures send a 500 with `'Failed to load sites'` (intentionally generic — Spider errors can leak URLs).

Note: the controller treats `body.sites` as a string (passed straight to Spider), but `LoadAgentSitesDto` may declare a different shape — read the DTO before changing the contract.

## Adjacent: text-to-speech

`ConvertTextToSpeech` (`src/components/ArtificialIntelligence/ConvertTextToSpeech/convert-text-to-speech.service.ts`) is not a chat tool — it's a standalone use case (`POST` under its own controller) that calls Google TTS, writes the mp3 to `uploads/audio/<uuid>.mp3`, then uploads to GCS and returns `{ audioPath, fileName, publicUrl }`. Reach for it from outside this skill's scope; mentioned here only so you don't confuse it with an agent tool.

## Common pitfalls

- **Re-enabling vector search but forgetting to ingest.** A fresh agent with `vector_search_tool=true` and zero chunks tagged with its `agent_id` will return empty `pageContent` joins; the model still tries to use the tool because the description tells it to. Either ingest sources first or disable the tool until they exist.
- **Calling `LoadDatabaseTool.execute(orgId)` without an org.** The sanitizer rejects every query for `organization_id = ''`. Always pass a real UUID.
- **Changing the deny regex.** It's a `\b...\b` word-boundary match; an SQL identifier coincidentally containing one of those words (e.g., a column named `dropbox_id`) is fine, but be careful with stored procedures and DO blocks if you expand the allow list.
- **Two database connections.** `LoadDatabaseTool` keeps its own `DataSource` — restarting TypeORM's connection (e.g., during a migration helper) does not affect this one and vice versa. If you add health checks, cover both.
- **Embedding cost.** `embedQuery` runs per chat call when the agent invokes the tool. There's no caching layer. High-volume agents will spend on embeddings — consider caching keyed by `(agentId, normalizedQuery)` if usage grows.
