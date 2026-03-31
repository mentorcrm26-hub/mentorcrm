-- ************ By Inova Digital Marketing ***************
-- ******************* inovamkt.io ************************
-- ******************* Paulo Daian ************************
-- *************** contact@inovamkt.io ******************

-- MIGRATION: Cold Call User Isolation
-- Created: 2026-03-31

-- 1. Add user_id column to cold_call_daily_stats
ALTER TABLE public.cold_call_daily_stats 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;

-- 2. Add user_id column to cold_call_targets
ALTER TABLE public.cold_call_targets 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;

-- 3. Update Existing Data (Link to tenant owner or first user)
-- Note: This is an approximation for existing data
UPDATE public.cold_call_daily_stats
SET user_id = (SELECT id FROM public.users WHERE tenant_id = cold_call_daily_stats.tenant_id LIMIT 1)
WHERE user_id IS NULL;

UPDATE public.cold_call_targets
SET user_id = (SELECT id FROM public.users WHERE tenant_id = cold_call_targets.tenant_id LIMIT 1)
WHERE user_id IS NULL;

-- 4. Update Unique Constraints
-- We need to drop the old unique constraints and add new ones including user_id
ALTER TABLE public.cold_call_daily_stats DROP CONSTRAINT IF EXISTS cold_call_daily_stats_tenant_id_date_key;
ALTER TABLE public.cold_call_daily_stats ADD CONSTRAINT cold_call_daily_stats_tenant_user_date_key UNIQUE(tenant_id, user_id, date);

ALTER TABLE public.cold_call_targets DROP CONSTRAINT IF EXISTS cold_call_targets_tenant_id_year_week_number_key;
ALTER TABLE public.cold_call_targets ADD CONSTRAINT cold_call_targets_tenant_user_year_week_key UNIQUE(tenant_id, user_id, year, week_number);

-- 5. Update the Trigger Function to accurately attribute stats to the assigned agent
CREATE OR REPLACE FUNCTION public.update_cold_call_stats_from_lead()
RETURNS TRIGGER AS $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Determine the user to attribute the stat to (assigned agent)
    -- Note: leads table has no created_by column, only assigned_to
    target_user_id := NEW.assigned_to;

    IF target_user_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Handle Meeting (Scheduled status)
    IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'Scheduled') 
       OR (TG_OP = 'INSERT' AND NEW.status = 'Scheduled') THEN
        INSERT INTO public.cold_call_daily_stats (tenant_id, user_id, date, meetings)
        VALUES (NEW.tenant_id, target_user_id, CURRENT_DATE, 1)
        ON CONFLICT (tenant_id, user_id, date)
        DO UPDATE SET meetings = public.cold_call_daily_stats.meetings + 1;
    END IF;

    -- Handle Sale (Won status)
    IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'Won') 
       OR (TG_OP = 'INSERT' AND NEW.status = 'Won') THEN
        INSERT INTO public.cold_call_daily_stats (tenant_id, user_id, date, sales)
        VALUES (NEW.tenant_id, target_user_id, CURRENT_DATE, 1)
        ON CONFLICT (tenant_id, user_id, date)
        DO UPDATE SET sales = public.cold_call_daily_stats.sales + 1;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
