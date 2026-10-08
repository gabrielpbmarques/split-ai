---
trigger: always_on
---

# RAG ingestion and the vector store

Thin path-scoped reminder. Full detail: the **`ai-agent-tools-and-rag`** skill. Covers every path that writes chunks into the Supabase `documents` table (`generate-agent-source`, the `process-*-source` services, OCR, `load-agent-sites`) and the `VECTOR_STORE` port (`SupabaseVectorStoreGateway` live, `MockVectorStoreGateway` in mock mode).

<critical_rule>
Every ingested chunk's `metadata` carries both `agent_id` and `source_id` (built by `buildSourceMetadata`). `VECTOR_STORE.upsertChunks(chunks, metadata)` merges that metadata into each row, and both keys are load-bearing:

- Missing `agent_id` → the chunk is invisible to `vector_similarity_search`, which filters by `{ agent_id }`. The model keeps calling the tool and gets nothing — a silent retrieval failure.
- Missing `source_id` → `DeleteSource` calls `VECTOR_STORE.deleteBySourceId(id)`, which filters `metadata->>source_id`, so those rows become permanent orphans.
  </critical_rule>

<rules>
- A new ingestion path tags both keys before calling `upsertChunks`; follow an existing `process-*-source` service as the template.
- Chunks no longer carry `organization_id`. Older rows may still have it in their metadata; it is ignored and harmless.
- Empty retrieval has two causes. Besides a missing `agent_id`, no chunk may have cleared the rerank threshold (`VECTOR_SEARCH_MIN_SCORE`). Tell them apart with the `VoyageRerankCompressor` warning: it fires with the best score only when candidates were retrieved and then filtered out. No warning means the dense search itself came back empty — the metadata bug.
- The `documents` table, its cosine index and `match_documents` live only in the Supabase project and are changed by hand in its SQL editor. TypeORM migrations never create or alter them.
- `POST /agent/generate-source` (`source.write`) validates the input (unsupported file type → 400, unknown agent → 404), creates the `sources` rows as `processing` and answers **202**; the indexing runs in the background (`Promise.allSettled`, never awaited by the request). Each task awaits the vector writes and moves the status to `completed` | `failed` with `error_message`; a task never rejects.
- A source soft-deleted while its task was still indexing is not resurrected: when the task finishes and the row is gone, it calls `deleteBySourceId` again and skips the status update.
- On boot, `RecordInterruptedSourcesService` marks every source still `processing` as `failed` ("Processamento interrompido."), since a restart kills the background tasks. With two instances overlapping in a deploy, a source still being indexed by the old one shows `failed` until that task finishes and writes `completed`.
</rules>
