-- MIGRATION: CRM-WORKFLOWS-FOUNDATION
-- AUTHOR: Antigravity

-- 1. Create workflows table
create table if not exists public.workflows (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  description text,
  is_active boolean default true,
  is_system boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. Create workflow_steps table
create table if not exists public.workflow_steps (
  id uuid primary key default uuid_generate_v4(),
  workflow_id uuid not null references public.workflows(id) on delete cascade,
  order_index integer not null default 0,
  type text not null check (type in ('message', 'document', 'forward', 'task', 'gate', 'start')),
  label text not null,
  config jsonb default '{}'::jsonb,
  position_x float default 0,
  position_y float default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 3. Create workflow_edges table (for connections)
create table if not exists public.workflow_edges (
  id uuid primary key default uuid_generate_v4(),
  workflow_id uuid not null references public.workflows(id) on delete cascade,
  source_step_id uuid not null references public.workflow_steps(id) on delete cascade,
  target_step_id uuid not null references public.workflow_steps(id) on delete cascade,
  source_handle text,
  label text,
  created_at timestamp with time zone default now()
);

-- 4. Create lead_workflows table (to track progress)
create table if not exists public.lead_workflows (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  workflow_id uuid not null references public.workflows(id) on delete cascade,
  current_step_id uuid references public.workflow_steps(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'completed', 'paused')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  tenant_id uuid not null references public.tenants(id) on delete cascade
);

-- 5. Helper function to get current user tenant id
create or replace function public.current_user_tenant_id()
returns uuid
language plpgsql
stable
security definer -- AVOID RLS RECURSION
set search_path = public
as $function$
declare
  t_id uuid;
begin
  -- 1. Try metadata
  t_id := (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid;
  if t_id is not null then
    return t_id;
  end if;

  -- 2. Try users table
  select tenant_id into t_id from public.users where id = auth.uid();
  return t_id;
end;
$function$;

-- 6. RLS Policies
alter table public.workflows enable row level security;
do $$ begin
  create policy "Users manage their own tenant workflows" 
  on public.workflows for all 
  using (tenant_id = public.current_user_tenant_id());
exception when duplicate_object then null; end $$;

alter table public.workflow_steps enable row level security;
do $$ begin
  create policy "Users manage their own tenant workflow steps" 
  on public.workflow_steps for all 
  using (workflow_id in (select id from public.workflows where tenant_id = public.current_user_tenant_id()));
exception when duplicate_object then null; end $$;

alter table public.workflow_edges enable row level security;
do $$ begin
  create policy "Users manage their own tenant workflow edges" 
  on public.workflow_edges for all 
  using (workflow_id in (select id from public.workflows where tenant_id = public.current_user_tenant_id()));
exception when duplicate_object then null; end $$;

alter table public.lead_workflows enable row level security;
do $$ begin
  create policy "Users manage their own tenant lead workflows" 
  on public.lead_workflows for all 
  using (tenant_id = public.current_user_tenant_id());
exception when duplicate_object then null; end $$;

-- 7. Add assigned_to to leads table for forwarding feature
alter table public.leads 
add column if not exists assigned_to uuid references public.users(id) on delete set null;

-- 8. Add index for performance
create index if not exists leads_assigned_to_idx on public.leads(assigned_to);
