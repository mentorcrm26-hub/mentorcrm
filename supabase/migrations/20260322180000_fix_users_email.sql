-- ************ By Inova Digital Marketing ***************
-- ******************* inovamkt.io ************************
-- ******************* Paulo Daian ************************
-- *************** contact@inovamkt.io ******************

-- Fix: Add email column to users table and backfill it from auth.users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;

UPDATE public.users u
SET email = a.email
FROM auth.users a
WHERE u.id = a.id AND (u.email IS NULL OR u.email = '');
