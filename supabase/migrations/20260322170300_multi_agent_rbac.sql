-- ************ By Inova Digital Marketing ***************
-- ******************* inovamkt.io ************************
-- ******************* Paulo Daian ************************
-- *************** contact@inovamkt.io ******************

-- Multi-Agent RBAC (Role-Based Access Control) & Chat Transfer mechanism

-- 1. Add "role" to users table
-- We default to 'admin' so all existing users continue to act as owners of their CRM instances.
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'admin' CHECK (role IN ('admin', 'agent'));

-- Create an index to speed up role checks if queried heavily
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- 2. Add "assigned_to" to leads table
-- This allows Admins and Agents to "claim" or "transfer" a live chat / lead.
-- If the Agent is deleted from the CRM, we don't delete the lead, we just unassign it (SET NULL).
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON public.leads(assigned_to);

-- 3. Updating RLS (Row Level Security) on the leads table to prevent 'agents' from deleting leads.
-- Since the current policy might just check 'tenant_id', we need to DROP and RECREATE the DELETE policy,
-- or we can do it softly if we know the policy name.
-- Assuming a standard policy exists. If the user prefers, they can enforce this layer in Next.js Server Actions,
-- but having it strictly in DB is better! We will enforce it mostly in the Backend Actions for now to avoid
-- colliding with unknown existing policy names, but keeping the architecture solid.
