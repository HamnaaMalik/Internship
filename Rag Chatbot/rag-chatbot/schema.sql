-- Enable pgvector
create extension if not exists vector;

-- Documents table
create table if not exists documents (
    id bigserial primary key,
    content text not null,
    source text,
    embedding vector(768)
);

-- Index for similarity search
create index if not exists documents_embedding_idx
    on documents using ivfflat (embedding vector_cosine_ops)
    with (lists = 100);

-- Function for similarity search
create or replace function match_documents (
    query_embedding vector(768),
    match_count int default 4
)
returns table (
    id bigint,
    content text,
    source text,
    similarity float
)
language sql
stable
set search_path = public, extensions
as $$
    select
        d.id,
        d.content,
        d.source,
        1 - (d.embedding <=> query_embedding) as similarity
    from public.documents as d
    where d.embedding is not null
    order by d.embedding <=> query_embedding
    limit greatest(match_count, 0);
$$;