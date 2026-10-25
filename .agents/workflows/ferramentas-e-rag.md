---
description: 'Ferramentas de agentes e pipeline de RAG: ToolLoaderService, VectorSearchToolService (vector_search), TavilySearchService (tavily_search), busca de similaridade no Supabase/pgvector, ingestão de fontes (PDF, DOCX, texto, OCR, Spider), embeddings Voyage e cross-encoder rerank-2.5 por limiar.'
---

# Ferramentas de agentes e RAG (recuperação e ingestão)

Cobre: `src/modules/tools/`, `src/modules/retrieval/`, `src/modules/sources/` e os provedores `voyage.provider.ts`, `supabase.provider.ts`, `spider.provider.ts` e `tavily.provider.ts`. Regras base em `.agents/rules/09-ferramentas-e-rag.md`.

## Arquitetura de ferramentas (`src/modules/tools/`)

`ToolLoaderService.execute(agent: AgentEntity)` (`src/modules/tools/tool-loader/tool-loader.service.ts`) percorre `agent.tools` (`string[]`) e instancia cada ferramenta habilitada, além de anexar os subagentes conectados via `AppendConnectionToolsService`:

<tabela>

| Identificador em `agent.tools`     | Nome da tool no LLM        | Service                        | Função                                                                       |
| ---------------------------------- | -------------------------- | ------------------------------ | ---------------------------------------------------------------------------- |
| `'vector_search'`                  | `vector_similarity_search` | `VectorSearchToolService`      | Busca densa nas fontes do agente + reranking cross-encoder Voyage            |
| `'tavily_search'`                  | `tavily_search`            | `TavilySearchService`          | Busca na web em tempo real via `TAVILY_SEARCH_SERVICE` (`@langchain/tavily`) |
| _(conexão em `agent_connections`)_ | `invoke_<identifier>`      | `AppendConnectionToolsService` | Invoca um subagente conectado como ferramenta                                |

</tabela>

A ferramenta de banco de dados externo (`execute_sql`, `CUSTOMER_DATABASE`) foi removida em definitivo.

## Ferramenta de busca vetorial — `src/modules/tools/vector-search-tool/vector-search-tool.service.ts`

```ts
new DynamicStructuredTool({
  name: 'vector_similarity_search',
  description: `...`,
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

- **`agent_id` é fechado por closure no servidor:** `VectorSearchToolService.execute(agentId)` recebe o UUID do agente resolvido; o modelo fornece apenas `query`. Nunca exponha `agent_id` no schema Zod da tool.
- **Filtro exclusivo por `{ agent_id }`:** `source_type` não filtra a busca, garantindo que arquivos sem tipo e sites rastreados sejam encontrados.
- **Retorno vazio (`""`) é um resultado válido por design** quando nenhum documento atinge o limiar do reranker (`VECTOR_SEARCH_MIN_SCORE`).

## Ferramenta de busca web — `src/modules/tools/tavily-search/tavily-search.service.ts`

Instancia a tool `tavily_search` injetando `TAVILY_SEARCH_SERVICE` (`src/infrastructure/providers/tavily.provider.ts`). Aceita parâmetros validados com Zod (`query`, `searchDepth`, `topic`, `timeRange`, `includeAnswer`, `includeRawContent`, `includeImages`, `includeDomains`, `excludeDomains`).

## Camada de Vector Store e Recuperação (`src/modules/retrieval/`)

### 1. `VECTOR_STORE_SERVICE.loadIndex(filter)` (`src/infrastructure/providers/supabase.provider.ts`)

- Tabela: `documents`; função RPC no Postgres: `match_documents` (gerenciadas manualmente no SQL Editor do Supabase, nunca pelo TypeORM).
- Embeddings: Voyage AI `voyage-3-large` (1024 dimensões) via `EMBEDDINGS_SERVICE`.

### 2. `ExecuteSimilaritySearchService` (`src/modules/retrieval/execute-similarity-search/execute-similarity-search.service.ts`)

```ts
const retriever = new ContextualCompressionRetriever({
  baseRetriever: vectorStore.asRetriever({
    k: env.VECTOR_SEARCH_CANDIDATE_K,
  }) as unknown as BaseRetrieverInterface,
  baseCompressor: this.rerankDocumentsService.execute(),
});

return retriever.invoke(question);
```

- A busca densa recupera até `VECTOR_SEARCH_CANDIDATE_K` candidatos (padrão `50`).
- `ContextualCompressionRetriever` vem de `@langchain/classic/retrievers/contextual_compression` com o cast documentado em PC-005.

### 3. `RerankDocumentsService` e `VoyageRerankCompressor` (`src/modules/retrieval/rerank-documents/`)

- Chama o modelo `rerank-2.5` da Voyage AI por meio do `RERANKER_SERVICE` (que usa o `ResilientClient`).
- Mantém apenas documentos com `relevanceScore >= env.VECTOR_SEARCH_MIN_SCORE` (padrão **`0.8`**), limitados a `env.VECTOR_SEARCH_MAX_RESULTS` (padrão `10`).
- Quando candidatos são encontrados pela busca densa mas nenhum atinge o limiar `0.8`, emite `this.logger.warn({ bestScore, ... }, 'rerank.below_threshold')` e retorna `[]`.

## Ingestão de fontes (`src/modules/sources/`)

- **Rota:** `POST /agent/generate-source` (`GenerateAgentSourceController`, permissão `source.write`).
- **Execução assíncrona (`202 Accepted`):** valida o agente (`404` se não existir) e os arquivos (`400` se extensão não suportada), cria os registros na tabela `sources` com `status = 'processing'` e devolve `202` imediatamente.
- **Processadores em background (`Promise.allSettled`):**
  - `process-pdf-source`, `process-docx-source`, `process-text-source`, `process-image-source` (OCR via `GOOGLE_VISION_SERVICE`) e `load-agent-sites` (crawling via `SPIDER_SERVICE`).
  - Todo chunk salvo com `VECTOR_STORE_SERVICE.upsertChunks(chunks, metadata)` **deve** conter `agent_id` e `source_id` nos metadados (`buildSourceMetadata`).
  - Ao concluir, a tarefa atualiza a fonte para `'completed'` (ou `'failed'` com `error_message`). Se a fonte foi excluída (`softDelete`) durante a indexação, a tarefa chama `deleteBySourceId` novamente e não ressuscita o status.
- **Exclusão (`DELETE /source/:id`):** chama `VECTOR_STORE_SERVICE.deleteBySourceId(id)` (que remove de `documents` onde `metadata->>source_id = id`) e faz `softDelete` na tabela `sources`.
- **Boot (`RecordInterruptedSourcesService`):** marca fontes que ficaram presas em `'processing'` após um reinício do servidor como `'failed'` (`"Processamento interrompido."`).
