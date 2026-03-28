-- ************ By Inova Digital Marketing ***************
-- ******************* inovamkt.io ************************
-- ******************* Paulo Daian ************************
-- *************** contact@inovamkt.io ******************

-- AI EMPLOYEE SCHEMA
-- Adds support for Vector Search (RAG) and AI Configurations

-- 1. Enable pgvector extension
create extension if not exists vector;

-- 2. AI CONFIGURATIONS TABLE
-- Stores specific settings for the AI Employee (Tone, Voice, Personality)
create table public.ai_configs (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null, -- e.g., "Receptionist", "Sales Agent"
  engine text not null default 'gpt-4o', -- openai model
  system_prompt text, -- The "personality" and rules
  voice_provider text, -- 'vapi', 'elevenlabs'
  voice_id text, -- ID from provider
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique (tenant_id, name)
);

-- 3. AI KNOWLEDGE BASE (Document Embeddings)
-- Stores chunks of text converted to vectors for RAG
create table public.ai_knowledge (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  config_id uuid references public.ai_configs(id) on delete cascade,
  content text not null, -- The original text chunk
  metadata jsonb, -- source file name, page, etc.
  embedding vector(1536), -- 1536 dimensions for OpenAI embeddings
  created_at timestamp with time zone default now()
);

-- 4. APPLY RLS POLICIES
alter table public.ai_configs enable row level security;
alter table public.ai_knowledge enable row level security;

-- AI CONFIGS RLS
create policy "Users manage their tenant ai configs" 
on public.ai_configs for all 
using (tenant_id = public.current_user_tenant_id());

-- AI KNOWLEDGE RLS
create policy "Users manage their tenant ai knowledge" 
on public.ai_knowledge for all 
using (tenant_id = public.current_user_tenant_id());

-- 5. VECTOR SEARCH FUNCTION
-- Used to find relevant knowledge chunks for the AI response
create or replace function public.match_ai_knowledge (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_tenant_id uuid
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    ai_knowledge.id,
    ai_knowledge.content,
    ai_knowledge.metadata,
    1 - (ai_knowledge.embedding <=> query_embedding) as similarity
  from ai_knowledge
  where ai_knowledge.tenant_id = p_tenant_id
    and 1 - (ai_knowledge.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;
