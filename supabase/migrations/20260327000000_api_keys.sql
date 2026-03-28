-- MIGRATION: 20260327000000_api_keys.sql
-- Descrição: Infraestrutura de chaves de API para clientes do CRM.

-- 1. Criação da Tabela de API Keys
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE, 
  key_preview TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Segurança (Isolamento por Tenant)
CREATE POLICY "Manage own tenant API keys" 
ON public.api_keys FOR ALL 
USING (tenant_id = public.current_user_tenant_id());

-- 4. Índices para Performance
CREATE INDEX IF NOT EXISTS idx_api_keys_tenant_id ON public.api_keys(tenant_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON public.api_keys(key_hash);

-- Comentários
COMMENT ON TABLE public.api_keys IS 'Tokens de acesso para integrações de clientes.';
