-- Add is_internal column to messages table
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_internal BOOLEAN DEFAULT false;

-- Add index for performance on filtering internal messages
CREATE INDEX IF NOT EXISTS idx_messages_is_internal ON public.messages(is_internal);

-- Update RLS policies to ensure users can still see their messages (already covered by tenant_id policy, but being explicit)
-- The existing policy on 'messages' table:
-- CREATE POLICY \"Users can view their tenant messages\" ON public.messages FOR ALL USING (tenant_id = public.current_user_tenant_id());
-- This policy already uses FOR ALL, so it covers INSERT, UPDATE, DELETE.
