-- ************ By Inova Digital Marketing ***************
-- ******************* inovamkt.io ************************
-- ******************* Paulo Daian ************************
-- *************** contact@inovamkt.io ******************

-- MIGRATION: Cold Call Metrics & Targets
-- Created: 2026-03-22

-- 1. Daily Stats Table
CREATE TABLE IF NOT EXISTS public.cold_call_daily_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    calls_made INTEGER DEFAULT 0,
    discovery_calls INTEGER DEFAULT 0,
    invites INTEGER DEFAULT 0,
    meetings INTEGER DEFAULT 0,
    no_shows INTEGER DEFAULT 0,
    sales INTEGER DEFAULT 0,
    UNIQUE(tenant_id, date)
);

-- 2. Weekly Targets Table
CREATE TABLE IF NOT EXISTS public.cold_call_targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    week_number INTEGER NOT NULL,
    calls_target INTEGER DEFAULT 100,
    discovery_target INTEGER DEFAULT 30,
    invites_target INTEGER DEFAULT 10,
    meetings_target INTEGER DEFAULT 10,
    no_shows_target INTEGER DEFAULT 0,
    sales_target INTEGER DEFAULT 5,
    UNIQUE(tenant_id, year, week_number)
);

-- 3. RLS
ALTER TABLE public.cold_call_daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cold_call_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own tenant daily stats" 
ON public.cold_call_daily_stats FOR ALL 
USING (tenant_id = public.current_user_tenant_id());

CREATE POLICY "Users view their own tenant weekly targets" 
ON public.cold_call_targets FOR ALL 
USING (tenant_id = public.current_user_tenant_id());

-- 4. Trigger for Automatic Increments (Meetings & Sales)
CREATE OR REPLACE FUNCTION public.update_cold_call_stats_from_lead()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle Meeting (Scheduled status)
    IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'Scheduled') 
       OR (TG_OP = 'INSERT' AND NEW.status = 'Scheduled') THEN
        INSERT INTO public.cold_call_daily_stats (tenant_id, date, meetings)
        VALUES (NEW.tenant_id, CURRENT_DATE, 1)
        ON CONFLICT (tenant_id, date)
        DO UPDATE SET meetings = public.cold_call_daily_stats.meetings + 1;
    END IF;

    -- Handle Sale (Won status)
    IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'Won') 
       OR (TG_OP = 'INSERT' AND NEW.status = 'Won') THEN
        INSERT INTO public.cold_call_daily_stats (tenant_id, date, sales)
        VALUES (NEW.tenant_id, CURRENT_DATE, 1)
        ON CONFLICT (tenant_id, date)
        DO UPDATE SET sales = public.cold_call_daily_stats.sales + 1;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lead_cold_call_trigger
AFTER INSERT OR UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.update_cold_call_stats_from_lead();
