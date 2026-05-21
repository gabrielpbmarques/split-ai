-- pgvector setup for LangChain SupabaseVectorStore.
-- Schema is the canonical one from LangChain docs, sized for
-- Voyage AI `voyage-3-large` (1024 dimensions, configurable via outputDimension).
--
-- ⚠ DESTRUCTIVE: drops `documents` and `match_documents` before recreating.
-- Vectors are tied to the embedding model that produced them, so changing
-- model/dimension makes existing rows unusable. Always re-ingest after
-- applying this migration (`bun run analytics:ingest-schema` +
-- `bun run analytics:ingest-domain`).
--
-- Apply via: bun run scripts/apply-pgvector-migration.ts
-- (or paste into the Supabase SQL editor).

create extension if not exists vector;

drop table if exists documents cascade;
drop function if exists match_documents(vector, int, jsonb);

create table documents (
  id        bigserial primary key,
  content   text,
  metadata  jsonb,
  embedding vector(1024)
);

create index documents_metadata_idx
  on documents using gin (metadata);

create index documents_embedding_idx
  on documents using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create function match_documents (
  query_embedding vector(1024),
  match_count int default 10,
  filter jsonb default '{}'::jsonb
) returns table (
  id         bigint,
  content    text,
  metadata   jsonb,
  similarity float
)
language plpgsql
as $$
#variable_conflict use_column
begin
  return query
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where documents.metadata @> filter
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;
