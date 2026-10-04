---
name: ai-agent-tools-and-rag
description: "Use for an agent's LangChain tools and RAG: vector_similarity_search, execute_sql and the LoadDatabaseTool SQL guardrails, the parser tool, pgvector/Supabase similarity search, Spider source ingestion, the documents table, Voyage embeddings, and the rerank-2.5 cross-encoder + relevance threshold. Scope: src/modules/retrieval/ + src/infrastructure/integration/{voyage,supabase,customer-database}/."
---

## Three tools an agent can carry

`ResolveAgent.loadTools(dbAgent)` (`src/modules/agent-runtime/resolve-agent/resolve-agent.service.ts`) reads three columns on `agents` and appends a tool for each:

| Flag / column                     | Tool                                       | Built by                                                                                    |
| --------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------- |
| `parser_schema` (jsonb, presence) | dynamic parser (no-op `func`, schema-only) | `buildLangchainToolFromSchema` in `src/shared/utils/buildZodSchema.ts`                             |
| `vector_search_tool` (bool)       | `vector_similarity_search`                 | `LoadVectorSearchToolService.execute()`                                                     |
| `database_tool` (bool)            | `execute_sql`                              | `LoadDatabaseToolService.execute({ databaseUrl })` — gated by `database_connection` feature |

Tools are returned as `DynamicStructuredTool<z.ZodObject<any>>[]` and threaded into `createAgent({ tools, ... })`. The same `tools` array is also rendered into the system prompt by `NormalizePromptInstructions` (`Name: ... / Description: ...`), so a model sees both the tool descriptors **and** a textual list.

## Parser tool — src/shared/utils/buildZodSchema.ts

```ts
buildLangchainToolFromSchema(name, description, schemaDef): DynamicStructuredTool
```

- `schemaDef` is a custom JSON DSL (`type`, `optional`, `enum`, `default`, `description`, nested `properties`, array `items`) — compiled into a Zod schema by `buildZodSchema`.
- The tool's `func` is `async () => {}` — invocation returns `undefined`. This is by design: the parser tool exists only so the model can emit a structured argument matching the schema. Use it when you want the agent to produce JSON in a specific shape during reasoning. **Do not** add side-effects here without first changing the contract — many call sites assume parser tools are inert.

## Vector search tool — src/modules/retrieval/load-vector-search-tool/load-vector-search-tool.service.ts

```ts
new DynamicStructuredTool({
  name: 'vector_similarity_search',
  description: 'IMPORTANTE: SEMPRE use esta ferramenta antes de responder. ...',
  schema: z.object({ query, agent_id, source_type }),
  func: async ({ query, agent_id, source_type }) => {
    const store = await loadVectorStoreService.execute({
      agent_id,
      source_type,
    });
    const docs = await executeSimilaritySearchService.execute(store, query);
    return docs.map((d) => d.pageContent).join('\n\n');
  },
});
```

- The description prompts the model to **always** call this tool first when the flag is on. Removing that line will shift agent behavior toward not retrieving — make the change deliberate.
- The tool returns `pageContent` joined by a blank line (`\n\n`), so the model sees chunk boundaries. `metadata.relevance_score` is stamped on each surviving document by the reranker but dropped here; if you need citations, return a structured payload and update consumers (today there are none beyond the LLM).
- **An empty string is a valid return.** Since retrieval became threshold-based, a query where nothing clears the rerank cutoff yields zero documents. That is the designed behaviour — do not "fix" it by removing the threshold.
- `agent_id` is **filled by the model** based on the system-prompt template (which interpolates `{agentId}`). Make sure that prompt variable is set in any caller (it is for chat flows — see `[[ai-agent-runtime]]`).

## Database tool — src/modules/retrieval/load-database-tool/load-database-tool.service.ts

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
- **Support another dialect.** Add the scheme detection in `src/infrastructure/integration/customer-database/sql-guard.ts` (`detectDialect`, with spec) and the driver options in `customer-database.gateway.ts`. Tested are `postgres` and `mysql`.
- **Tighten verbs.** Restrict to `SELECT` only for read-only analytics use cases.

## Vector store layer

### `VECTOR_STORE.loadIndex(filter)` — src/infrastructure/integration/supabase/supabase-vector-store.gateway.ts

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
- `embeddings` is the `EMBEDDINGS` port (Voyage `voyage-3-large` live, `MockEmbeddings` in mock mode), injected into the gateway by `integration.module.ts`. `LoadVectorSearchTool` injects `VECTOR_STORE` directly; there is no `LoadVectorStoreService` any more.

### ExecuteSimilaritySearch — src/modules/retrieval/execute-similarity-search/execute-similarity-search.service.ts

```ts
const retriever = new ContextualCompressionRetriever({
  baseRetriever: vectorStore.asRetriever({ k: env.VECTOR_SEARCH_CANDIDATE_K }),
  baseCompressor: this.rerankDocumentsService.execute(),
});

return retriever.invoke(question);
```

- **The dense search only generates candidates.** `vectorSearchCandidateK` (default 50, env `VECTOR_SEARCH_CANDIDATE_K`) is a recall ceiling, not a relevance criterion — relevance is decided by the reranker below. The old hard-coded `topK = 10` is gone.
- **Never pass `filter` to `asRetriever`.** `loadIndex` fixes `this.filter` at construction, and a second filter makes `_searchSupabase` throw `"cannot provide both filter and this.filter"`.
- `asRetriever` embeds the query internally, so this is still **one** embedding call per search. The service receives a LangChain `VectorStoreInterface` and injects no embeddings.
- `ContextualCompressionRetriever` comes from **`@langchain/classic`**, not `langchain` — the classic retrievers moved packages and `langchain@1.2.x` no longer exports them.
- The `as unknown as BaseRetrieverInterface` cast on the base retriever is packaging friction, not a real mismatch: under `NodeNext`, `@langchain/community` resolves its CJS typings back to the ESM ones, so both packages see the same declaration under two identities. Removing the cast breaks `bun run build`.

### RerankDocuments — src/modules/retrieval/rerank-documents/rerank-documents.service.ts

`execute()` returns a `VoyageRerankCompressor extends BaseDocumentCompressor` (from `@langchain/classic/retrievers/document_compressors`) wrapping the `RERANKER` port (`VoyageRerankerGateway` over `ResilientClient`, Zod-validated response).

`compressDocuments(documents, query)`:

1. Empty input → `[]`, without calling the API.
2. `rerank(query, documents.map((d) => d.pageContent))` → Voyage `POST /v1/rerank`; results arrive sorted by descending relevance, so filter-then-slice preserves the ranking.
3. Keep `relevanceScore >= env.VECTOR_SEARCH_MIN_SCORE` (default **0.8**), cap at `env.VECTOR_SEARCH_MAX_RESULTS` (default 10), stamp `metadata.relevance_score`.
4. Nothing clears the bar → `logger.warn` with the best score seen, return `[]`.

- **Why the threshold lives on the rerank score and not on the cosine score.** `match_documents` already returns rows ordered by `embedding <=> query_embedding`, so filtering on that same similarity adds no signal the ordering did not already carry — and a bi-encoder's scale is not comparable across queries. The cross-encoder scores query and document _together_, so a fixed cutoff is meaningful. Measured against pt-BR content: direct answers 0.87–0.96, partial matches ~0.76, related-but-wrong ~0.49, off-topic 0.20–0.34.
- Tuning is **env-only** (`VECTOR_SEARCH_MIN_SCORE`, `VECTOR_SEARCH_MAX_RESULTS`, `VECTOR_SEARCH_CANDIDATE_K`) and deliberately **not** a column on `agents` — a per-agent knob would need a migration and a UI; tune the env first.
- The reranker consumes the same Voyage quota as the embeddings, so a search now costs **two** Voyage calls instead of one.

## Site ingestion — src/modules/agents/load-agent-sites/load-agent-sites.service.ts

Endpoint `POST /agent/load-sites` (admin-only). Body: `{ sites: string, agentId: string }`.

1. `spiderService.crawl(sites, { limit: 20, depth: 25, metadata: true, readability: true, return_format: 'text' })` — third-party crawler at `spider.cloud`.
2. `vectorStore.upsertChunks(chunks, { source_type: 'site', agent_id, source_id })` — chunks and embeds into the `documents` table, tagged with `source_type: 'site'` so the vector search tool can retrieve them under that agent.

Returns the chunk count. Failures send a 500 with `'Failed to load sites'` (intentionally generic — Spider errors can leak URLs).

Note: the controller treats `body.sites` as a string (passed straight to Spider), but `LoadAgentSitesDto` may declare a different shape — read the DTO before changing the contract.

## Adjacent: text-to-speech

`ConvertTextToSpeech` (`src/modules/voice/convert-text-to-speech/convert-text-to-speech.service.ts`) is not a chat tool — it's a standalone use case (`POST` under its own controller) that calls Google TTS, writes the mp3 to `uploads/audio/<uuid>.mp3`, then uploads to GCS and returns `{ audioPath, fileName, publicUrl }`. Reach for it from outside this skill's scope; mentioned here only so you don't confuse it with an agent tool.

## Common pitfalls

- **Re-enabling vector search but forgetting to ingest.** A fresh agent with `vector_search_tool=true` and zero chunks tagged with its `agent_id` will return an empty join; the model still tries to use the tool because the description tells it to. Either ingest sources first or disable the tool until they exist. Note this looks identical to "nothing cleared the rerank threshold" — the `VoyageRerankCompressor` `logger.warn` fires only in the second case, so its absence points at ingestion/metadata.
- **`database_tool=true` but no feature flag.** The tool will be silently absent. Check `organization_features` for the `database_connection` feature row and `organizations.database_url` before debugging why the LLM "ignored" the tool — it never saw it.
- **Pool leak per request.** Each tool build opens a fresh TypeORM pool against the customer DB; nothing closes it explicitly today. Monitor connection counts on the customer side if the org gets heavy traffic.
- **Changing the deny regex.** It's a `\b...\b` word-boundary match; an SQL identifier coincidentally containing one of those words (e.g., a column named `dropbox_id`) is fine, but be careful with stored procedures and DO blocks if you expand the allow list.
- **Retrieval cost is two Voyage calls per invocation** — one embed (inside `asRetriever`) plus one rerank over the candidates — on the same `VOYAGEAI_API_KEY` and the same org-wide quota. There's no caching layer. `VECTOR_SEARCH_CANDIDATE_K` drives the rerank bill directly: with ~1800-char chunks (`src/shared/utils/chunkText.ts`) 50 candidates run ~28k rerank tokens per call. High-volume agents should consider caching keyed by `(agentId, normalizedQuery)`, or a smaller `k`.
