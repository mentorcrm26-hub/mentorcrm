-- Create appointment settings table
CREATE TABLE IF NOT EXISTS public.appointment_settings (
    tenant_id UUID PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
    reminder_1h_template_id UUID REFERENCES public.message_templates(id) ON DELETE SET NULL,
    reminder_30m_template_id UUID REFERENCES public.message_templates(id) ON DELETE SET NULL,
    notify_professional_30m BOOLEAN DEFAULT TRUE,
    professional_phone TEXT,
    professional_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.appointment_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own appointment settings"
ON public.appointment_settings FOR ALL
USING (tenant_id = public.current_user_tenant_id());

-- Inserir registros default para tenants existentes
INSERT INTO public.appointment_settings (tenant_id)
SELECT id FROM public.tenants
ON CONFLICT (tenant_id) DO NOTHING;
