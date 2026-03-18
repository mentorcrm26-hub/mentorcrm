-- ==========================================
-- Mentor CRM - Auto Garbage Collection Func
-- Função para buscar trials expirados (> 5 dias)
-- e limpar todos os dados do banco inteiramente
-- ==========================================

CREATE OR REPLACE FUNCTION public.cleanup_expired_trials()
RETURNS integer AS $$
DECLARE
    deleted_count integer := 0;
    tenant_record record;
BEGIN
    -- Percorre todos os tenants com trial expirado há mais de 5 dias
    -- Obs: usamos 5 dias conforme definido na interface
    FOR tenant_record IN 
        SELECT id FROM public.tenants 
        WHERE status = 'trial' 
        AND created_at < now() - interval '5 days'
    LOOP
        -- 1. Exclui os usuários da tabela auth.users (Tabela base de autenticação do Supabase)
        -- O Cascade vai remover automaticamente os registros da public.users
        DELETE FROM auth.users 
        WHERE id IN (
            SELECT id FROM public.users WHERE tenant_id = tenant_record.id
        );
        
        -- 2. Exclui o Workspace/Tenant
        -- O Cascade vai remover os Leads (public.leads) e as Integrações
        DELETE FROM public.tenants WHERE id = tenant_record.id;
        
        deleted_count := deleted_count + 1;
    END LOOP;

    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
