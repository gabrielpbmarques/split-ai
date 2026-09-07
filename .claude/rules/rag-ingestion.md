---
paths:
  - 'src/components/Source/**/*.ts'
  - 'src/components/OCR/**/*.ts'
  - 'src/components/ArtificialIntelligence/LoadAgentSites/**/*.ts'
  - 'src/infrastructure/providers/supabase.provider.ts'
---

# Scoped rule — RAG ingestion & vector store

Thin path-scoped reminder. Full detail: the **`ai-agent-tools-and-rag`** skill. Covers every path that writes chunks into the `documents` pgvector table (Source routes, OCR, `LoadAgentSites`) and `SupabaseService`.

Must-not-break invariants:

- **Every ingested chunk's `metadata` must carry both `agent_id` and `source_id`.** `SupabaseService.createVectorStore` merges the passed `metadata` into each `documents` row **and** uses it as the retrieval filter — so the two keys are load-bearing, not decorative:
  - **Missing `agent_id`** → the chunk is invisible to `vector_similarity_search` (`LoadVectorSearchTool` filters the store by `{ agent_id }`). The model keeps calling the tool (its description tells it to) but gets empty `pageContent` — a silent, hard-to-debug retrieval failure.
  - **Missing `source_id`** → `DeleteSource` deletes by `.eq('metadata->>source_id', id)` only, so those rows can never be reached — permanent orphan chunks.
- **Empty retrieval has two causes now — don't misdiagnose.** Besides a missing `agent_id`, a query can legitimately return nothing because no chunk cleared the rerank threshold (`VECTOR_SEARCH_MIN_SCORE`, default 0.8). The two look identical from the chat side. Tell them apart with the `VoyageRerankCompressor` `logger.warn`: it fires with the best score seen only when candidates _were_ retrieved and then filtered out. No warning at all means the dense search itself came back empty — that is the metadata bug.
- **Any new ingestion path must tag both keys before calling `createVectorStore`.** Follow an existing `Process*Source` service as the template.
- **pgvector schema is applied by hand, and is not in the repo.** There is no `migrations/` directory (deleted in `cfa5375`) and no `.sql` file anywhere — the `documents` table, its cosine index and the `match_documents` function live only in the Supabase project. TypeORM `synchronize` creates none of them. Any vector-schema change goes through the Supabase SQL editor.
