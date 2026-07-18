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
- **Any new ingestion path must tag both keys before calling `createVectorStore`.** Follow an existing `Process*Source` service as the template.
- **pgvector schema is applied manually** (`migrations/create_documents_pgvector.sql` via `bun run scripts/apply-pgvector-migration.ts`) — TypeORM `synchronize` does not create the `vector` extension or the cosine index.
