---
name: ai-agent-tools-and-rag
description: 'Use when: adding or modifying LangChain tools available to an agent (vector search, SQL execution, parser); changing pgvector / Supabase similarity search behavior; ingesting new sources via Spider; touching the SQL guardrails in LoadDatabaseTool; or working with embeddings, the documents table, or Voyage embedding configuration.'
---

## Three tools an agent can carry

`ResolveAgent.loadTools(dbAgent)` (`src/components/ArtificialIntelligence/ResolveAgent/resolve-agent.service.ts`) reads three columns on `agents` and appends a tool for each:

| Flag / column                     | Tool                                       | Built by                                                                                    |
| --------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------- |
| `parser_schema` (jsonb, presence) | dynamic parser (no-op `func`, schema-only) | `buildLangchainToolFromSchema` in `src/utils/buildZodSchema.ts`                             |
| `vector_search_tool` (bool)       | `vector_similarity_search`                 | `LoadVectorSearchToolService.execute()`                                                     |
| `database_tool` (bool)            | `execute_sql`                              | `LoadDatabaseToolService.execute({ databaseUrl })` — gated by `database_connection` feature |

Tools are returned as `DynamicStructuredTool<z.ZodObject<any>>[]` and threaded into `createAgent({ tools, ... })`. The same `tools` array is also rendered into the system prompt by `NormalizePromptInstructions` (`Name: ... / Description: ...`), so a model sees both the tool descriptors **and** a textual list.

## Parser tool — src/utils/buildZodSchema.ts

```ts
buildLangchainToolFromSchema(name, description, schemaDef): DynamicStructuredTool
```

- `schemaDef` is a custom JSON DSL (`type`, `optional`, `enum`, `default`, `description`, nested `properties`, array `items`) — compiled into a Zod schema by `buildZodSchema`.
- The tool's `func` is `async () => {}` — invocation returns `undefined`. This is by design: the parser tool exists only so the model can emit a structured argument matching the schema. Use it when you want the agent to produce JSON in a specific shape during reasoning. **Do not** add side-effects here without first changing the contract — many call sites assume parser tools are inert.

## Vector search tool — src/components/Tools/LoadVectorSearchTool/load-vector-search-tool.service.ts

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

## Database tool — src/components/Tools/LoadDatabaseTool/load-database-tool.service.ts

A SQL-execution tool with **heavy guardrails**, scoped to the **customer's own DB** (per-organization). The tool is feature-gated: `ResolveAgent` only injects it when:

1. `agents.database_tool = true`
2. `agents.organization_id` is set
3. `organization_features` has `(organization_id, feature_key='database_connection', enabled=true)` (joined via `OrganizationFeatureRepository.isEnabledForOrganization`)
4. `organizations.database_url` is populated

Any check failing → the tool is silently absent from the agent's tool list.

### Build (per request)

`execute({ databaseUrl })` constructs the tool lazily:

- Detects dialect from the URL prefix: `postgres://` / `postgresql://` → Postgres; `mysql://` / `mysql2://` → MySQL. Other schemes → `BadRequestException`.
- Creates a fresh TypeORM `DataSource` per call and `await dataSource.initialize()`.
- `SqlDatabase.fromDataSourceParams({ appDataSource })` introspects the schema via `getTableInfo()` (all tables — no allow-list). The schema is embedded in the tool description so the LLM sees what's available.

### Execution (`func`)

1. `sanitizeSqlQuery(query)` — see rules below.
2. `db.run(sanitizedQuery)` (SqlDatabase) — raw SQL execution.
3. Returns the LangChain `SqlDatabase` result string.

### Guardrails in `sanitizeSqlQuery`

- **Single statement only.** More than one `;` (or a stray statement after a trailing semicolon) throws `'multiple statements are not allowed.'`.
- **Verb allow-list.** Must start with `select`, `insert`, or `update` (case-insensitive). Everything else throws. There is **no** tenant filter check anymore — each org has its own DB.
- **Deny regex.** `\b(DELETE|ALTER|DROP|CREATE|REPLACE|TRUNCATE)\b` — caught even if the query starts with an allowed verb (defense against multi-keyword payloads).
- **LIMIT cap.** If the query does not end with `LIMIT n[, m]` the tool appends ` LIMIT 5`. Small. If the model needs more rows, it must specify its own LIMIT.

### Description prompt

The tool's `description` is dialect-aware (PostgreSQL vs MySQL label) and embeds the introspected schema. The "REGRAS DE OURO" tell the LLM about the verb allow-list, single-statement rule, default LIMIT 5, and to prefer explicit column lists over `SELECT *`. Change the description and you change the model's SQL style.

### Common edits

- **Cache DataSources across requests.** Today each `execute({ databaseUrl })` call opens a fresh pool. For a tenant with many sessions this is wasteful. Add a process-level LRU keyed by URL with TTL.
- **Support another dialect.** Add the scheme detection + the TypeORM type in `detectDialect`. Tested are `postgres` and `mysql`.
- **Tighten verbs.** Restrict to `SELECT` only for read-only analytics use cases.

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
- `embeddings` is `VoyageEmbeddings` provided via `VOYAGE_EMBEDDINGS` token from `src/infrastructure/providers/voyage-embeddings.provider.ts`. Don't `new` it inline — DI it.

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
- Embeds the query separately (via `VoyageEmbeddings.embedQuery`) and passes the precomputed vector to the search. This is intentional — you can reuse the embedding if you need to log it.
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
- **`database_tool=true` but no feature flag.** The tool will be silently absent. Check `organization_features` for the `database_connection` feature row and `organizations.database_url` before debugging why the LLM "ignored" the tool — it never saw it.
- **Pool leak per request.** Each tool build opens a fresh TypeORM pool against the customer DB; nothing closes it explicitly today. Monitor connection counts on the customer side if the org gets heavy traffic.
- **Changing the deny regex.** It's a `\b...\b` word-boundary match; an SQL identifier coincidentally containing one of those words (e.g., a column named `dropbox_id`) is fine, but be careful with stored procedures and DO blocks if you expand the allow list.
- **Embedding cost.** `embedQuery` runs per chat call when the agent invokes the tool. There's no caching layer. High-volume agents will spend on embeddings — consider caching keyed by `(agentId, normalizedQuery)` if usage grows.
