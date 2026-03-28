-- ************ By Inova Digital Marketing ***************
-- ******************* inovamkt.io ************************
-- ******************* Paulo Daian ************************
-- *************** contact@inovamkt.io ******************

-- SUPABASE SCHEMA INIT
-- Tables & RLS Policies for Mentor CRM (Multi-tenant)

-- Extensions
create extension if not exists "uuid-ossp";

-- 1. TENANTS TABLE
create table public.tenants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  status text not null default 'trial', -- 'trial', 'active', 'inactive'
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. USERS TABLE
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  role text not null default 'agent', -- 'admin', 'agent'
  full_name text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 3. LEADS TABLE
create table public.leads (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  birth_date date,
  origin text,
  product_interest text,
  notes text,
  status text not null default 'Novo Lead', -- corresponds to Kanban stage
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 4. INTEGRATIONS TABLE (BYOK - Resend, Twilio)
create table public.integrations (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  provider text not null, -- 'resend', 'twilio', 'google_calendar'
  credentials jsonb not null, 
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique (tenant_id, provider)
);

-- 5. ADMIN SETTINGS (Evolution API info etc.)
create table public.admin_settings (
  id text primary key,
  key_name text not null,
  key_value text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);


-- ==========================================
-- DEFINE RLS HELPER FUNCTION
-- ==========================================
-- Now that users table exists, we can create the function
create or replace function public.current_user_tenant_id()
returns uuid as $$
  select tenant_id from public.users where id = auth.uid()
$$ language sql stable security definer;


-- ==========================================
-- APPLY RLS POLICIES
-- ==========================================

-- TENANTS RLS
alter table public.tenants enable row level security;
create policy "Tenants can view their own tenant details" 
on public.tenants for select 
using (id = public.current_user_tenant_id() OR auth.jwt() ->> 'role' = 'service_role');

-- USERS RLS
alter table public.users enable row level security;
create policy "Users can view members of their own tenant" 
on public.users for select 
using (tenant_id = public.current_user_tenant_id() OR auth.jwt() ->> 'role' = 'service_role');
create policy "Users can update their own profile" 
on public.users for update 
using (id = auth.uid());

-- LEADS RLS
alter table public.leads enable row level security;
create policy "Users view only their tenant leads" 
on public.leads for all 
using (tenant_id = public.current_user_tenant_id());

-- INTEGRATIONS RLS
alter table public.integrations enable row level security;
create policy "Users manage their own tenant integrations" 
on public.integrations for all 
using (tenant_id = public.current_user_tenant_id());

-- ADMIN SETTINGS RLS
alter table public.admin_settings enable row level security;
create policy "Only service_role can access admin settings"
on public.admin_settings for all
using (auth.jwt() ->> 'role' = 'service_role');
