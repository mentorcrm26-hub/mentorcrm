-- Create the system_integrations table to store Master credentials
CREATE TABLE IF NOT EXISTS public.system_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT KEY NULL UNIQUE, -- 'google' or 'apple' (Only 1 master calendar of each)
    credentials JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.system_integrations ENABLE ROW LEVEL SECURITY;

-- Allow only authenticated users to view/manage integrations
CREATE POLICY "Allow authenticated users to manage system_integrations" 
ON public.system_integrations 
FOR ALL USING (auth.role() = 'authenticated');

-- Modify leads table to hold external calendar IDs
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS google_event_id TEXT,
ADD COLUMN IF NOT EXISTS apple_event_id TEXT;
