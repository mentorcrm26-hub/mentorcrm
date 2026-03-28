-- ************ By Inova Digital Marketing ***************
-- ******************* inovamkt.io ************************
-- ******************* Paulo Daian ************************
-- *************** contact@inovamkt.io ******************

-- Criação das Tabelas de Tags

-- 1. Tabela Principal de Tags
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color_hex TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de Relacionamento N:M (Lead <-> Tag)
CREATE TABLE IF NOT EXISTS public.lead_tags (
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY(lead_id, tag_id)
);

-- 3. Enabling RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_tags ENABLE ROW LEVEL SECURITY;

-- 4. RLS for Tags
CREATE POLICY "Users can manage tags in their tenant" ON public.tags 
    FOR ALL 
    USING (tenant_id = current_user_tenant_id());

-- 5. RLS for lead_tags
CREATE POLICY "Users can manage lead_tags in their tenant" ON public.lead_tags 
    FOR ALL 
    USING (
        lead_id IN (SELECT id FROM public.leads WHERE tenant_id = current_user_tenant_id())
    );

-- 6. Indexes para Performance Kanban
CREATE INDEX IF NOT EXISTS tags_tenant_id_idx ON public.tags(tenant_id);
CREATE INDEX IF NOT EXISTS lead_tags_lead_id_idx ON public.lead_tags(lead_id);
CREATE INDEX IF NOT EXISTS lead_tags_tag_id_idx ON public.lead_tags(tag_id);
