---
description: Use for an agent's LangChain tools and RAG
---

## Site ingestion — src/modules/agents/load-agent-sites/load-agent-sites.service.ts

Endpoint `POST /agent/load-sites` (`agent.manage`, admin only). Body: `{ sites: string, agentId: string }`.

1. `SITE_CRAWLER.crawl(sites, { limit, depth })` — the Spider gateway (`spider.cloud`), mocked in tests.
2. `vectorStore.upsertChunks(chunks, { source_type: 'site', agent_id, source_id })` — chunks and embeds into the `documents` table. The vector search tool retrieves them by `agent_id` alone; `source_type` is informational.

Responds `200 { message: 'Sites loaded successfully' }`; errors go through the global exception filter. `LoadAgentSitesDto.sites` is a single string passed straight to the crawler.

## Adjacent: text-to-speech

`ConvertTextToSpeech` (`src/modules/voice/convert-text-to-speech/convert-text-to-speech.service.ts`) is not a chat tool — it's a standalone use case (`POST` under its own controller) that calls Google TTS, writes the mp3 to `uploads/audio/<uuid>.mp3`, then uploads to GCS and returns `{ audioPath, fileName, publicUrl }`. Reach for it from outside this skill's scope; mentioned here only so you don't confuse it with an agent tool.

## Common pitfalls

- **Re-enabling vector search but forgetting to ingest.** A fresh agent with `vector_search_tool=true` and zero chunks tagged with its `agent_id` will return an empty join; the model still tries to use the tool because the description tells it to. Either ingest sources first or disable the tool until they exist. Note this looks identical to "nothing cleared the rerank threshold" — the `VoyageRerankCompressor` `logger.warn` fires only in the second case, so its absence points at ingestion/metadata.
- **`database_tool=true` but no `database_url`.** The tool will be silently absent. Check `SELECT database_tool, database_url IS NOT NULL FROM agents WHERE id = …` before debugging why the LLM "ignored" the tool — it never saw it.
- **Changing the deny regex.** It's a `\b...\b` word-boundary match; an SQL identifier coincidentally containing one of those words (e.g., a column named `dropbox_id`) is fine, but be careful with stored procedures and DO blocks if you expand the allow list.
- **Retrieval cost is two Voyage calls per invocation** — one embed (inside `asRetriever`) plus one rerank over the candidates — on the same `VOYAGEAI_API_KEY` and the same Voyage account quota. There's no caching layer. `VECTOR_SEARCH_CANDIDATE_K` drives the rerank bill directly: with ~1800-char chunks (`src/shared/utils/chunk-text.ts`) 50 candidates run ~28k rerank tokens per call. High-volume agents should consider caching keyed by `(agentId, normalizedQuery)`, or a smaller `k`.
