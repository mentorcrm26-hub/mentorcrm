-- Table to store team plan contact requests from the /assinar?plan=team page

CREATE TABLE IF NOT EXISTS public.team_requests (
    id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        text NOT NULL,
    email       text NOT NULL,
    phone       text NOT NULL,
    team_size   text NOT NULL,
    message     text,
    status      text NOT NULL DEFAULT 'pending', -- 'pending', 'contacted', 'converted', 'dismissed'
    created_at  timestamp with time zone DEFAULT now()
);

-- Super admins can read and manage all team requests
ALTER TABLE public.team_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage team requests"
ON public.team_requests FOR ALL
USING (public.is_super_admin() OR auth.jwt() ->> 'role' = 'service_role');
