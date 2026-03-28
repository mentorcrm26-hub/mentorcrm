-- ************ By Inova Digital Marketing ***************
-- ******************* inovamkt.io ************************
-- ******************* Paulo Daian ************************
-- *************** contact@inovamkt.io ******************

-- MIGRATION: CRM-AUTOMATIONS-1 (MEETING REMINDERS & MIRRORING)
-- AUTHOR: Antigravity

-- 1. Add meeting_at (Already in schema, but for safety)
alter table public.leads add column if not exists meeting_at timestamp with time zone;

-- 2. Add meeting_notified (JSONB to track reminder states: e.g. {"1h": true, "30m": true})
alter table public.leads add column if not exists meeting_notified jsonb default '{}'::jsonb;

-- 3. Ensure users have phone or WhatsApp for Mirroring
alter table public.users add column if not exists phone text;

-- 4. Enable efficient querying for cron search
create index if not exists leads_meeting_at_idx on public.leads (meeting_at);
create index if not exists leads_meeting_notified_idx on public.leads using gin (meeting_notified);
