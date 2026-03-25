-- MIGRATION: DRAW SYSTEM
-- Feature: Whiteboard/Canvas drawings linked to leads

-- 1. drawings table (the primary asset - tenant-scoped reusable drawings)
create table if not exists public.drawings (
  id            uuid primary key default uuid_generate_v4(),
  tenant_id     uuid not null references public.tenants(id) on delete cascade,
  created_by    uuid references public.users(id) on delete set null,
  title         text not null default 'Untitled Drawing',
  canvas_data   jsonb not null default '{}'::jsonb,  -- Fabric.js serialized JSON
  thumbnail_url text,                                -- PNG stored in Supabase Storage
  width         integer not null default 1280,
  height        integer not null default 720,
  created_at    timestamp with time zone default now(),
  updated_at    timestamp with time zone default now()
);

-- 2. drawing_leads junction table (1 drawing → N leads)
create table if not exists public.drawing_leads (
  id          uuid primary key default uuid_generate_v4(),
  drawing_id  uuid not null references public.drawings(id) on delete cascade,
  lead_id     uuid not null references public.leads(id) on delete cascade,
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  linked_at   timestamp with time zone default now(),
  unique(drawing_id, lead_id)
);

-- 3. Indexes for performance
create index if not exists idx_drawings_tenant_id   on public.drawings(tenant_id);
create index if not exists idx_drawings_created_by  on public.drawings(created_by);
create index if not exists idx_drawings_updated_at  on public.drawings(updated_at desc);
create index if not exists idx_drawing_leads_drawing on public.drawing_leads(drawing_id);
create index if not exists idx_drawing_leads_lead    on public.drawing_leads(lead_id);
create index if not exists idx_drawing_leads_tenant  on public.drawing_leads(tenant_id);

-- 4. RLS Policies
alter table public.drawings enable row level security;
do $$ begin
  create policy "Users manage their own tenant drawings"
  on public.drawings for all
  using (tenant_id = public.current_user_tenant_id());
exception when duplicate_object then null; end $$;

alter table public.drawing_leads enable row level security;
do $$ begin
  create policy "Users manage their own tenant drawing leads"
  on public.drawing_leads for all
  using (tenant_id = public.current_user_tenant_id());
exception when duplicate_object then null; end $$;

-- 5. Storage bucket setup
INSERT INTO storage.buckets (id, name, public)
VALUES ('drawings', 'drawings', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Storage RLS Policies (Fix for: new row violates row-level security policy)
-- Users must be authenticated to upload
CREATE POLICY "Authenticated users can upload drawings"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'drawings');

-- Users can select/read thumbnails (public access)
CREATE POLICY "Public preview access for drawings"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'drawings');

-- Users can update/delete their own drawing files
CREATE POLICY "Authenticated users can update their drawings"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'drawings');

CREATE POLICY "Authenticated users can delete their drawings"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'drawings');
