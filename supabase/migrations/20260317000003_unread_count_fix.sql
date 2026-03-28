-- ************ By Inova Digital Marketing ***************
-- ******************* inovamkt.io ************************
-- ******************* Paulo Daian ************************
-- *************** contact@inovamkt.io ******************

-- ENSURE UNREAD COUNT INTEGRITY
-- Set default value to 0 and fix existing NULLs
UPDATE public.conversations SET unread_count = 0 WHERE unread_count IS NULL;

ALTER TABLE public.conversations 
ALTER COLUMN unread_count SET DEFAULT 0,
ALTER COLUMN unread_count SET NOT NULL;

-- Fix RPC to handle potentially NULL inputs safely (fallback)
CREATE OR REPLACE FUNCTION public.increment_unread_count(conv_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.conversations
    SET unread_count = COALESCE(unread_count, 0) + 1,
        updated_at = now()
    WHERE id = conv_id;
END;
$$;
