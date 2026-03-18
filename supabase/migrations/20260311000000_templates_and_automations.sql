-- MIGRATION: CRM-TEMPLATES-AND-AUTOMATIONS
-- AUTHOR: Antigravity

-- 1. Create message_templates table
create table if not exists public.message_templates (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  subject text, -- only for email
  content text not null,
  type text not null check (type in ('email', 'whatsapp')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. Create automations table
create table if not exists public.automations (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  trigger_event text not null, -- 'new_lead', 'status_change'
  trigger_condition jsonb, -- e.g. {"status": "Agendado"}
  template_id uuid references public.message_templates(id) on delete cascade,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 3. RLS Policies
alter table public.message_templates enable row level security;
create policy "Users manage their own tenant templates" 
on public.message_templates for all 
using (tenant_id = public.current_user_tenant_id());

alter table public.automations enable row level security;
create policy "Users manage their own tenant automations" 
on public.automations for all 
using (tenant_id = public.current_user_tenant_id());
