---
trigger: glob
description: 'Ferramentas de agentes e RAG: ToolLoaderService, vector_search, tavily_search, busca por limiar com VoyageRerankCompressor, ingestão assíncrona (202) e metadados agent_id + source_id.'
globs: 'src/modules/tools/**, src/modules/retrieval/**, src/modules/sources/**, src/infrastructure/providers/voyage.provider.ts, src/infrastructure/providers/supabase.provider.ts, src/infrastructure/providers/spider.provider.ts, src/infrastructure/providers/tavily.provider.ts'
---

# Ferramentas de agentes e RAG (recuperação e ingestão)

Cobre: carregamento e execução de ferramentas (`src/modules/tools/`), pipeline de busca vetorial e reranking (`src/modules/retrieval/`), ingestão de fontes de conhecimento (`src/modules/sources/`) e provedores `VECTOR_STORE_SERVICE`, `EMBEDDINGS_SERVICE`, `RERANKER_SERVICE`, `SPIDER_SERVICE` e `TAVILY_SEARCH_SERVICE`. Detalhes profundos estão na skill `ferramentas-e-rag`.

## Ferramentas de agentes (`src/modules/tools/`)

<regras>
- **Configuração por array de strings no agente:** `AgentEntity.tools` armazena os identificadores das ferramentas ativas (ex.: `['vector_search', 'tavily_search']`), com padrão `['vector_search']`. O `ToolLoaderService` (`src/modules/tools/tool-loader/`) resolve e instancia as ferramentas ativas do agente (além de anexar subagentes conectados via `AppendConnectionToolsService`).
- **Uma ferramenta = um service:** cada implementação de ferramenta vive em `src/modules/tools/<tool-name>/` com um único `@Injectable()` cujo método `execute(...)` retorna uma `AgentTool`. Descrições de ferramentas e de seus parâmetros Zod (`.describe(...)`) voltadas ao LLM são escritas em **português**.
- **Ferramentas disponíveis no catálogo (`ToolLoaderService`):**
  - `'vector_search'` → `VectorSearchToolService` (`vector_similarity_search`): busca semântica na base de conhecimento do agente;
  - `'tavily_search'` → `TavilySearchService` (`tavily_search`): busca na web em tempo real via `TAVILY_SEARCH_SERVICE` (`@langchain/tavily`, suportando `searchDepth`, `topic`, `timeRange`, `includeAnswer`, `includeRawContent`, `includeImages`, `includeDomains`, `excludeDomains`);
  - Subagentes conectados (`agent_connections`) → expostos como ferramentas adicionais por `AppendConnectionToolsService`.
- **Ferramenta de banco externo removida:** `execute_sql` e `CUSTOMER_DATABASE` foram removidos em definitivo; agentes não abrem conexões com bancos de dados de clientes.
</regras>

## Busca vetorial e Reranking (`src/modules/retrieval/`)

<regras>
- **`vector_similarity_search` é vinculada por closure ao agente:** `VectorSearchToolService.execute(agentId)` fecha escopo (closure) sobre o UUID do agente resolvido e filtra `loadIndex({ agent_id: agentId })` — exclusivamente por `agent_id`, nunca por `source_type`, garantindo que arquivos ingeridos sem tipo e sites rastreados sejam encontrados. **Nunca** coloque `agent_id` de volta no schema Zod da ferramenta ou em placeholder de prompt: o modelo escolheria o valor e poderia consultar fontes de outro agente.
- **Busca baseada em limiar (threshold), não em top-K fixo:**
  1. A busca densa no pgvector (`match_documents`) recupera apenas candidatos iniciais (`VECTOR_SEARCH_CANDIDATE_K`, padrão `50`).
  2. O cross-encoder `rerank-2.5` da Voyage (`VoyageRerankCompressor`) reordena os candidatos e mantém apenas aqueles com `relevance_score >= VECTOR_SEARCH_MIN_SCORE` (padrão `0.8`), limitados a `VECTOR_SEARCH_MAX_RESULTS` (padrão `10`).
  3. Um resultado vazio é um desfecho esperado por design quando nenhum trecho atinge o limiar. Antes de "corrigir" falta de contexto, leia o log `warn` (`rerank.below_threshold`) emitido pelo `VoyageRerankCompressor` (que informa o `bestScore`) e avalie ajustar `VECTOR_SEARCH_MIN_SCORE`. Nunca mova a nota de corte para o score de cosseno do pgvector: `match_documents` já ordena por ele, portanto não traz sinal extra de precisão.
- **Cast requerido pelo LangChain (PC-005):** `ContextualCompressionRetriever` é importado de `@langchain/classic/retrievers/contextual_compression` com o cast intencional `as unknown as BaseRetrieverInterface` em `execute-similarity-search.service.ts`.
</regras>

## Ingestão de fontes e Vector Store (`src/modules/sources/`)

<regra critica="true">
Todo chunk ingerido na tabela `documents` do Supabase deve carregar no seu `metadata` **ambas** as chaves `agent_id` e `source_id` (construídas por `buildSourceMetadata`). `VECTOR_STORE_SERVICE.upsertChunks(chunks, metadata)` mescla esses metadados em cada linha inserida, e ambas as chaves são vitais:

- **Sem `agent_id`:** o chunk fica invisível para `vector_similarity_search`, que filtra por `{ agent_id }`. O modelo chama a ferramenta repetidamente e recebe vazio — uma falha silenciosa de recuperação.
- **Sem `source_id`:** `DeleteSourceService` chama `VECTOR_STORE_SERVICE.deleteBySourceId(id)`, que filtra por `metadata->>source_id`. Sem essa chave, os chunks viram órfãos permanentes no pgvector mesmo após a fonte ser excluída.
</regra>

<regras>
- Qualquer novo caminho de ingestão deve preencher `agent_id` e `source_id` antes de chamar `upsertChunks`; siga os services `process-*-source` existentes como modelo (`process-pdf-source`, `process-docx-source`, `process-text-source`, `process-image-source`, `load-agent-sites`).
- Chunks não carregam mais `organization_id` (linhas antigas que ainda o tenham no JSONB são ignoradas sem impacto).
- **Como diagnosticar recuperação vazia (duas causas possíveis):** além da ausência de `agent_id` nos metadados, nenhum chunk pode ter superado o limiar `VECTOR_SEARCH_MIN_SCORE`. Diferencie os dois casos pelo log `rerank.below_threshold` do `VoyageRerankCompressor`: ele só dispara (com o `bestScore`) quando a busca densa trouxe candidatos e o reranker os filtrou. Se não houver warning, a própria busca densa no pgvector voltou vazia (indício de problema nos metadados ou fonte ainda não indexada).
- A tabela `documents`, seu índice de cosseno e a função RPC `match_documents` existem apenas no projeto Supabase e são gerenciados manualmente no editor SQL do Supabase. Migrations do TypeORM nunca criam nem alteram essas estruturas.
- **Ingestão assíncrona (`POST /agent/generate-source`):** exige permissão `source.write`, valida a entrada sincronamente (tipo de arquivo não suportado → `400`, agente inexistente → `404`), cria as linhas na tabela `sources` com `status = 'processing'` e responde **`202 Accepted`**. A indexação roda em segundo plano (`Promise.allSettled`, sem bloquear a resposta HTTP). Cada tarefa aguarda a escrita vetorial e atualiza o status da fonte para `'completed'` (com contagem de chunks) ou `'failed'` (com `error_message`), nunca rejeitando sem tratamento.
- **Exclusão concorrente com indexação:** se uma fonte for excluída (`softDelete`) enquanto sua tarefa em segundo plano ainda estava indexando, ela não é ressuscitada: ao terminar e perceber que a linha da fonte não está mais ativa, a tarefa chama `deleteBySourceId` novamente para limpar os chunks recém-gravados e pula a atualização de status.
- **Recuperação de fontes interrompidas no boot (`RecordInterruptedSourcesService`):** na inicialização da aplicação, toda fonte que permaneceu com `status = 'processing'` (porque um restart matou as tarefas em memória) é marcada como `'failed'` com a mensagem `"Processamento interrompido."`.
</regras>
