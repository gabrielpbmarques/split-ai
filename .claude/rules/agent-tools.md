---
trigger: always_on
---

# Agent tools — `src/modules/tools/` and `src/modules/retrieval/`

Thin path-scoped reminder. Full detail: the **`ai-agent-tools-and-rag`** skill. Tool loading lives in `src/modules/tools/` (`tool-loader`, `vector-search-tool`, `tavily-search`) and the retrieval pipeline in `src/modules/retrieval/` (`execute-similarity-search`, `rerank-documents`).

<rules>
- **Tools are configured via string array on the agent.** `AgentEntity.tools` stores an array of active tool identifiers (e.g. `['vector_search']`), defaulting to `['vector_search']`. `ToolLoaderService` (`src/modules/tools/tool-loader/`) resolves and instantiates tools for the agent.
- **One tool = one service.** Tool implementations live in `src/modules/tools/` with a single `@Injectable()` whose `execute(...)` returns an `AgentTool`.
- **`vector_similarity_search` is threshold-based, not top-K.** The dense search only produces candidates (`VECTOR_SEARCH_CANDIDATE_K`, default 50); the Voyage `rerank-2.5` cross-encoder keeps those with `relevance_score >= VECTOR_SEARCH_MIN_SCORE` (default 0.8), capped at `VECTOR_SEARCH_MAX_RESULTS`. An empty result is a designed outcome. Before "fixing" missing context, read the `VoyageRerankCompressor` warning (it logs the best score) and consider lowering the threshold. Never move the cutoff onto the cosine score: `match_documents` already orders by it, so it carries no extra signal.
- **`vector_similarity_search` is bound to its agent.** `VectorSearchToolService.execute(agentId)` closes over the resolved agent's UUID and filters `loadIndex({ agent_id: agentId })` — by agent only, never by `source_type`, so files ingested without a type and sites are found. Never put `agent_id` back in the tool schema or a prompt placeholder: the model would choose it, and it can pick another agent's sources.
- **Structured output is configured via `response_format`.** JSON schema configuration is stored on `agent.response_format` and passed to `AgentFinalResponseSchema` in `GenerateAiResponseService`.
- **Database tool (`execute_sql`) and `CUSTOMER_DATABASE` are removed.** The external database tool was removed on 2026-10-12; agents do not open external database connections.
</rules>
