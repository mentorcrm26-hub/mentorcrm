-- ************ By Inova Digital Marketing ***************
-- ******************* inovamkt.io ************************
-- ******************* Paulo Daian ************************
-- *************** contact@inovamkt.io ******************

-- CHAT SYSTEM STABILIZATION
-- 1. Ensure the conversations table has a unique constraint for multi-tenant lead management
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'conversations_tenant_lead_unique') THEN
        ALTER TABLE public.conversations ADD CONSTRAINT conversations_tenant_lead_unique UNIQUE (tenant_id, lead_id);
    END IF;
END $$;

-- 2. Create RPC for unread count if it doesn't exist
CREATE OR REPLACE FUNCTION public.increment_unread_count(conv_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.conversations
    SET unread_count = unread_count + 1,
        updated_at = now()
    WHERE id = conv_id;
END;
$$;

-- 3. Enable Realtime for Chat Tables
DO $$
BEGIN
    -- Garantir que a publicação existe
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;

    -- Adicionar tabelas apenas se NÃO forem membros
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'conversations'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
    END IF;
END $$;

ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;

-- 4. Ensure RLS is active and correct
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Conversations Policy
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can view their tenant conversations') THEN
        CREATE POLICY "Users can view their tenant conversations" ON public.conversations
        FOR ALL USING (tenant_id = public.current_user_tenant_id());
    END IF;
END $$;

-- Messages Policy
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can view their tenant messages') THEN
        CREATE POLICY "Users can view their tenant messages" ON public.messages
        FOR ALL USING (tenant_id = public.current_user_tenant_id());
    END IF;
END $$;
