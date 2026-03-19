-- Add profile fields to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS google_meet_link TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS other_meet_link TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;

-- Update RLS (already covered by "Users can update their own profile")
-- create policy "Users can update their own profile" 
-- on public.users for update 
-- using (id = auth.uid());
