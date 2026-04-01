
-- ************ By Inova Digital Marketing ***************
-- ******************* inovamkt.io ************************
-- ******************* Paulo Daian ************************
-- *************** contact@inovamkt.io ******************

-- 1. Função de Limpeza de Orphans
-- Esta função monitora mudanças na associação de usuários e limpa workspaces sandbox vazios.

CREATE OR REPLACE FUNCTION public.cleanup_orphan_sandbox_tenants()
RETURNS TRIGGER AS $$
DECLARE
    user_count INTEGER;
BEGIN
    -- 1. Verificar se o tenant_id foi ALTERADO (usuário movido para outro workspace)
    IF OLD.tenant_id IS NOT NULL AND (NEW.tenant_id != OLD.tenant_id) THEN
        
        -- 2. Contar quantos usuários RESTAM no tenant antigo
        SELECT count(*) INTO user_count FROM public.users WHERE tenant_id = OLD.tenant_id;

        -- 3. Se não sobra NINGUÉM e era um tenant restrito (Sandbox/Trial), nós o removemos.
        IF user_count = 0 THEN
            DELETE FROM public.tenants 
            WHERE id = OLD.tenant_id 
              AND (plan = 'sandbox' OR status = 'trial' OR status = 'inactive'); 
        END IF;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Aplicar o Trigger na tabela de Users
DROP TRIGGER IF EXISTS tr_cleanup_tenant_on_user_move ON public.users;
CREATE TRIGGER tr_cleanup_tenant_on_user_move
    AFTER UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.cleanup_orphan_sandbox_tenants();


-- 3. Bonus: Tratamento para o caso de o Admin "Evoluir" o plano no MESMO workspace
-- Neste caso, o workspace deixa de ser "Sandbox" mas não precisa ser excluído. 
-- A lógica acima já garante isso (não deleta se o usuário ainda estiver lá).

COMMENT ON FUNCTION public.cleanup_orphan_sandbox_tenants() IS 'Detecta quando um usuário é movido de um workspace sandbox para um novo workspace (geralmente pago/VIP) e exclui o sandbox antigo se ele ficar vazio.';
