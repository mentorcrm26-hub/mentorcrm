
-- ************ By Inova Digital Marketing ***************
-- ******************* inovamkt.io ************************
-- ******************* Paulo Daian ************************
-- *************** contact@inovamkt.io ******************

-- MIGRATION: Global Super Admin RLS Overwrite
-- This migration ensures that the is_super_admin() helper is used across ALL CRM tables
-- to allow impersonation and global monitoring as requested.

-- 1. Helper function for global access (already created but ensuring it works for RLS)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.system_admins WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 2. LEADS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view only their tenant leads" ON public.leads;
CREATE POLICY "Users view only their tenant leads" ON public.leads FOR ALL 
USING (tenant_id = public.current_user_tenant_id() OR public.is_super_admin());

-- 3. TENANTS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tenants can view their own tenant details" ON public.tenants;
CREATE POLICY "Tenants can view their own tenant details" ON public.tenants FOR SELECT 
USING (id = public.current_user_tenant_id() OR public.is_super_admin() OR auth.jwt() ->> 'role' = 'service_role');

-- 4. USERS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view members of their own tenant" ON public.users;
CREATE POLICY "Users can view members of their own tenant" ON public.users FOR SELECT 
USING (tenant_id = public.current_user_tenant_id() OR public.is_super_admin() OR auth.jwt() ->> 'role' = 'service_role');

-- 5. COLD CALL STATS
ALTER TABLE public.cold_call_daily_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view their own tenant daily stats" ON public.cold_call_daily_stats;
CREATE POLICY "Users view their own tenant daily stats" ON public.cold_call_daily_stats FOR ALL 
USING (tenant_id = public.current_user_tenant_id() OR public.is_super_admin());

-- 6. COLD CALL TARGETS
ALTER TABLE public.cold_call_targets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view their own tenant weekly targets" ON public.cold_call_targets;
CREATE POLICY "Users view their own tenant weekly targets" ON public.cold_call_targets FOR ALL 
USING (tenant_id = public.current_user_tenant_id() OR public.is_super_admin());

-- 7. CALENDAR EVENTS
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage their own tenant events" ON public.calendar_events;
CREATE POLICY "Users manage their own tenant events" ON public.calendar_events FOR ALL 
USING (tenant_id = public.current_user_tenant_id() OR public.is_super_admin());

-- 8. TAGS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage their own tenant tags" ON public.tags;
CREATE POLICY "Users manage their own tenant tags" ON public.tags FOR ALL 
USING (tenant_id = public.current_user_tenant_id() OR public.is_super_admin());

-- 9. INTEGRATIONS
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage their own tenant integrations" ON public.integrations;
CREATE POLICY "Users manage their own tenant integrations" ON public.integrations FOR ALL 
USING (tenant_id = public.current_user_tenant_id() OR public.is_super_admin());

-- 10. MESSAGE TEMPLATES
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage their message templates" ON public.message_templates;
CREATE POLICY "Users manage their message templates" ON public.message_templates FOR ALL 
USING (tenant_id = public.current_user_tenant_id() OR public.is_super_admin());

-- 11. MESSAGES
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage their messages" ON public.messages;
CREATE POLICY "Users manage their messages" ON public.messages FOR ALL 
USING (tenant_id = public.current_user_tenant_id() OR public.is_super_admin());

-- 12. CONVERSATIONS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage their conversations" ON public.conversations;
CREATE POLICY "Users manage their conversations" ON public.conversations FOR ALL 
USING (tenant_id = public.current_user_tenant_id() OR public.is_super_admin());

-- 13. DRAW TEMPLATES
ALTER TABLE public.draw_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage their draw templates" ON public.draw_templates;
CREATE POLICY "Users manage their draw templates" ON public.draw_templates FOR ALL 
USING (tenant_id = public.current_user_tenant_id() OR public.is_super_admin());

COMMENT ON POLICY "Users view only their tenant leads" ON public.leads IS 'Admins have global visibility whereas standard users see only their own tenant data.';
