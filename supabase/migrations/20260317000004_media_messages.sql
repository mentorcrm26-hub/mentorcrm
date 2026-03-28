-- ************ By Inova Digital Marketing ***************
-- ******************* inovamkt.io ************************
-- ******************* Paulo Daian ************************
-- *************** contact@inovamkt.io ******************

-- ADD MEDIA COLUMNS TO MESSAGES
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS media_url TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS media_type TEXT; -- 'image', 'video', 'document', 'audio'

-- Create public storage bucket for chat media
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-media', 'chat-media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to the bucket
CREATE POLICY "Authenticated users can upload chat media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chat-media');

-- Allow public read access to chat media
CREATE POLICY "Public can read chat media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'chat-media');

-- Allow users to delete their own uploads
CREATE POLICY "Authenticated users can delete their chat media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'chat-media');
