---
name: ai-agent-tools-and-rag
description: "Use for an agent's tools and RAG: ToolLoaderService, VectorSearchToolService ('vector_search'), pgvector/Supabase similarity search, Spider source ingestion, the documents table, Voyage embeddings, and the rerank-2.5 cross-encoder + relevance threshold. Scope: src/modules/tools/ + src/modules/retrieval/ + src/infrastructure/integration/{voyage,supabase}."
---

## Tools architecture (`src/modules/tools/`)

`ToolLoaderService.execute(agent: AgentEntity)` (`src/modules/tools/tool-loader/tool-loader.service.ts`) iterates `agent.tools` (`string[]`) and instantiates each requested tool:

| Tool name       | Provider                  | Notes                                                          |
| --------------- | ------------------------- | -------------------------------------------------------------- |
| `vector_search` | `VectorSearchToolService` | Dense search over agent's sources with cross-encoder reranking |

Tools are returned as `AgentTool[]` (`DynamicStructuredTool[]`) and passed to `createDeepAgent({ tools, ... })`.

## Vector search tool — src/modules/tools/vector-search-tool/vector-search-tool.service.ts

```ts
new DynamicStructuredTool({
  name: 'vector_search',
  description: `
    IMPORTANTE: SEMPRE use esta ferramenta antes de responder.
    Busca embeddings no Supabase; use se precisar de contexto factual externo.
    A busca já é restrita às fontes deste agente.
  `,
  schema: z.object({
    query: z.string().describe('Consulta semântica'),
  }),
  func: async ({ query }) => {
    const vectorStore = await this.vectorStore.loadIndex({ agent_id: agentId });
    const retrievedDocuments =
      await this.executeSimilaritySearchService.execute(vectorStore, query);
    return retrievedDocuments
      .map((doc: CustomDocument) => doc.pageContent)
      .join('\n\n');
  },
});
```

- Description prompts the model to always search for factual external context when available.
- Joined by `\n\n` so the model sees chunk boundaries.
- **An empty string is a valid return** when no chunks clear the rerank cutoff (`VECTOR_SEARCH_MIN_SCORE`).
- **`agent_id` is bound by the server.** `VectorSearchToolService.execute(agentId)` closes over the agent's ID; the model only provides `query`.

## Vector store layer

### `VECTOR_STORE.loadIndex(filter)` — src/infrastructure/integration/supabase/supabase-vector-store.gateway.ts

```ts
SupabaseVectorStore.fromExistingIndex(embeddings, {
  client: supabaseClient,
  tableName: 'documents',
  queryName: `match_${tableName}`,
  filter,
});
```

- Default table is `documents`; the matching Postgres function is `match_documents`.
- `filter` is `{ agent_id }`.
- `embeddings` is Voyage `voyage-3-large` (1024 dims).

### ExecuteSimilaritySearch — src/modules/retrieval/execute-similarity-search/execute-similarity-search.service.ts

```ts
const retriever = new ContextualCompressionRetriever({
  baseRetriever: vectorStore.asRetriever({ k: env.VECTOR_SEARCH_CANDIDATE_K }),
  baseCompressor: this.rerankDocumentsService.execute(),
});

return retriever.invoke(question);
```

- Dense search retrieves candidates (`VECTOR_SEARCH_CANDIDATE_K`, default 50).
- Relevance is decided by the cross-encoder reranker below.

### RerankDocuments — src/modules/retrieval/rerank-documents/rerank-documents.service.ts

`execute()` returns a `VoyageRerankCompressor` wrapping Voyage `rerank-2.5` via `ResilientClient`:

- Keeps documents with `relevanceScore >= env.VECTOR_SEARCH_MIN_SCORE` (default **0.8**), capped at `env.VECTOR_SEARCH_MAX_RESULTS` (default 10).
- When nothing clears the bar, logs `logger.warn` with the best score and returns `[]`.

## Knowledge ingestion

- Files and text sources are processed via `POST /agent/generate-source`.
- Every chunk written to `documents` carries `agent_id` and `source_id` in its metadata (`buildSourceMetadata`).
- `DELETE /source/:id` calls `VECTOR_STORE.deleteBySourceId(id)` and soft-deletes the source.

## Common pitfalls

- **Re-enabling vector search without sources:** Search returns empty if no documents exist for the agent.
- **Voyage quota:** Search uses two Voyage calls (embed + rerank) on `VOYAGEAI_API_KEY`.
