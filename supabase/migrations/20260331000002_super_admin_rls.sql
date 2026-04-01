
-- ************ By Inova Digital Marketing ***************
-- ******************* inovamkt.io ************************
-- ******************* Paulo Daian ************************
-- *************** contact@inovamkt.io ******************

-- 1. Redefine current_user_tenant_id function to allow Super Admins to "Impersonate" 
-- by checking if a search param or session variable exists. 
-- However, for performance and simplicity in RLS, we'll just allow Super Admins
-- to pass ANY tenant_id filtering while we update policies.

-- 2. Update LEADS table policies to allow Super Admins
DROP POLICY IF EXISTS "Users view only their tenant leads" ON public.leads;
CREATE POLICY "Users view only their tenant leads" 
ON public.leads FOR ALL 
USING (tenant_id = public.current_user_tenant_id() OR public.is_super_admin());

-- 3. Update TENANTS table policies
DROP POLICY IF EXISTS "Tenants can view their own tenant details" ON public.tenants;
CREATE POLICY "Tenants can view their own tenant details" 
ON public.tenants FOR SELECT 
USING (id = public.current_user_tenant_id() OR public.is_super_admin() OR auth.jwt() ->> 'role' = 'service_role');

-- 4. Update USERS table policies
DROP POLICY IF EXISTS "Users can view members of their own tenant" ON public.users;
CREATE POLICY "Users can view members of their own tenant" 
ON public.users FOR SELECT 
USING (tenant_id = public.current_user_tenant_id() OR public.is_super_admin() OR auth.jwt() ->> 'role' = 'service_role');

-- 5. Update INTEGRATIONS table
DROP POLICY IF EXISTS "Users manage their own tenant integrations" ON public.integrations;
CREATE POLICY "Users manage their own tenant integrations" 
ON public.integrations FOR ALL 
USING (tenant_id = public.current_user_tenant_id() OR public.is_super_admin());

-- 6. Update MESSAGE TEMPLATES (from high-level schema)
DROP POLICY IF EXISTS "Users manage their message templates" ON public.message_templates;
CREATE POLICY "Users manage their message templates" 
ON public.message_templates FOR ALL 
USING (tenant_id = public.current_user_tenant_id() OR public.is_super_admin());

-- 7. Update MESSAGES
DROP POLICY IF EXISTS "Users manage their messages" ON public.messages;
CREATE POLICY "Users manage their messages" 
ON public.messages FOR ALL 
USING (tenant_id = public.current_user_tenant_id() OR public.is_super_admin());

-- 8. Update CONVERSATIONS
DROP POLICY IF EXISTS "Users manage their conversations" ON public.conversations;
CREATE POLICY "Users manage their conversations" 
ON public.conversations FOR ALL 
USING (tenant_id = public.current_user_tenant_id() OR public.is_super_admin());
