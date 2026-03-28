-- ************ By Inova Digital Marketing ***************
-- ******************* inovamkt.io ************************
-- ******************* Paulo Daian ************************
-- *************** contact@inovamkt.io ******************

-- MIGRATION: 20260328120000_native_tags.sql
-- Descrição: Adiciona o conceito de tags nativas (protegidas) e semeia as tags "Closed" e "Lost".

-- 1. Adicionar coluna is_native na tabela tags
ALTER TABLE public.tags ADD COLUMN IF NOT EXISTS is_native BOOLEAN DEFAULT FALSE;

-- 2. Semear as tags nativas para todos os tenants existentes
DO $$
DECLARE
    tenant_rec RECORD;
BEGIN
    FOR tenant_rec IN SELECT id FROM public.tenants LOOP
        -- Inserir Tag 'Lost' (Vermelho) se não existir
        IF NOT EXISTS (SELECT 1 FROM public.tags WHERE tenant_id = tenant_rec.id AND name = 'Lost') THEN
            INSERT INTO public.tags (tenant_id, name, color_hex, is_native)
            VALUES (tenant_rec.id, 'Lost', '#ef4444', TRUE);
        ELSE
            UPDATE public.tags SET is_native = TRUE, color_hex = '#ef4444' 
            WHERE tenant_id = tenant_rec.id AND name = 'Lost';
        END IF;

        -- Inserir Tag 'Closed' (Verde) se não existir
        IF NOT EXISTS (SELECT 1 FROM public.tags WHERE tenant_id = tenant_rec.id AND name = 'Closed') THEN
            INSERT INTO public.tags (tenant_id, name, color_hex, is_native)
            VALUES (tenant_rec.id, 'Closed', '#10b981', TRUE);
        ELSE
            UPDATE public.tags SET is_native = TRUE, color_hex = '#10b981'
            WHERE tenant_id = tenant_rec.id AND name = 'Closed';
        END IF;
    END LOOP;
END $$;

-- 3. Proteger via RLS (Usando DROP para evitar erro se rodar de novo)
DROP POLICY IF EXISTS "Native tags cannot be deleted" ON public.tags;
CREATE POLICY "Native tags cannot be deleted" ON public.tags
    FOR DELETE
    USING (is_native = FALSE);

-- 4. Limpeza Automática dos Leads (Passo Crucial indicado pela imagem)
-- Remove as etiquetas "Closed" e "Lost" de leads que NÃO estão ganhos ou perdidos.
DELETE FROM public.lead_tags
WHERE tag_id IN (SELECT id FROM public.tags WHERE is_native = TRUE AND name IN ('Closed', 'Lost'))
AND lead_id IN (
    SELECT id FROM public.leads 
    WHERE status NOT IN ('Won', 'Lost')
);
