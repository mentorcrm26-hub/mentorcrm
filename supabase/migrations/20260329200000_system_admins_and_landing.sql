-- ************ By Inova Digital Marketing ***************
-- ******************* inovamkt.io ************************
-- ******************* Paulo Daian ************************
-- *************** contact@inovamkt.io ******************

-- 1. Tabela de Administradores do Sistema (Super Admins)
-- Isso isola o acesso Master do CRM, adicionando uma camada extra de segurança.
CREATE TABLE IF NOT EXISTS public.system_admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ativa RLS
ALTER TABLE public.system_admins ENABLE ROW LEVEL SECURITY;

-- Apenas o Service Role ou o próprio admin pode ler.
CREATE POLICY "System Admins can read their own record" 
ON public.system_admins FOR SELECT 
USING (id = auth.uid() OR auth.jwt() ->> 'role' = 'service_role');

-- 2. Função de HELPER: Verificar se o usuário logado é Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.system_admins WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;


-- 3. Tabela de Configuração da Landing Page
CREATE TABLE IF NOT EXISTS public.landing_page_config (
    id TEXT PRIMARY KEY DEFAULT 'global',
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'maintenance'
    
    -- Plan Agent Solo
    plan_agent_name TEXT DEFAULT 'AGENT (SOLO)',
    plan_agent_price TEXT DEFAULT '$49/mês',
    plan_agent_price_yearly TEXT DEFAULT 'ou $490/ano',
    plan_agent_features JSONB DEFAULT '[]'::jsonb,
    plan_agent_cta TEXT DEFAULT 'INICIAR TESTE REAL (3 DIAS)',
    
    -- Plan Team
    plan_team_name TEXT DEFAULT 'TEAM (AGÊNCIA)',
    plan_team_price TEXT DEFAULT '$99/mês',
    plan_team_meta TEXT DEFAULT '(3 agentes inclusos)',
    plan_team_features JSONB DEFAULT '[]'::jsonb,
    plan_team_cta TEXT DEFAULT 'FALAR COM TIME / VENDAS',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Landing page configuration can be read by ANYONE (it's public).
ALTER TABLE public.landing_page_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read landing page config" 
ON public.landing_page_config FOR SELECT USING (true);

-- Only Super Admins can update.
CREATE POLICY "Only Super Admins can update landing page config"
ON public.landing_page_config FOR UPDATE USING (public.is_super_admin());

CREATE POLICY "Only Super Admins can insert landing page config"
ON public.landing_page_config FOR INSERT WITH CHECK (public.is_super_admin());

-- Preencher valores default para a Landing (se não existir).
INSERT INTO public.landing_page_config (id, plan_agent_features, plan_team_features) 
VALUES (
  'global', 
  '["Leads ilimitados", "Automação email/sms", "(automação sms sem suporte)", "Analíticos avançados", "Automações"]'::jsonb,
  '["3 Conexões de WhatsApp", "Automações", "Ranking e estatísticas", "Onboarding Prioritário", "Distribuição de Leads", "Automação email e sms (com suporte)"]'::jsonb
) ON CONFLICT DO NOTHING;
