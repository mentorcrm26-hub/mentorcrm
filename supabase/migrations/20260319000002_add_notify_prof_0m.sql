-- ************ By Inova Digital Marketing ***************
-- ******************* inovamkt.io ************************
-- ******************* Paulo Daian ************************
-- *************** contact@inovamkt.io ******************

-- Add notify_professional_0m column to appointment_settings table
ALTER TABLE public.appointment_settings ADD COLUMN IF NOT EXISTS notify_professional_0m BOOLEAN DEFAULT false;
