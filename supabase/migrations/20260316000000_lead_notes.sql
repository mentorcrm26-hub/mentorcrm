-- ************ By Inova Digital Marketing ***************
-- ******************* inovamkt.io ************************
-- ******************* Paulo Daian ************************
-- *************** contact@inovamkt.io ******************

-- Migração para sistema de notas estruturado
create table if not exists public.lead_notes (
    id uuid primary key default uuid_generate_v4(),
    lead_id uuid not null references public.leads(id) on delete cascade,
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    content text not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- RLS
alter table public.lead_notes enable row level security;

create policy "Users manage their own lead notes"
on public.lead_notes for all
using (tenant_id = public.current_user_tenant_id());

-- Função para migrar notas existentes (opcional, mas recomendado)
do $$
begin
    insert into public.lead_notes (lead_id, tenant_id, content)
    select id, tenant_id, notes 
    from public.leads 
    where notes is not null and notes != '';
end $$;
