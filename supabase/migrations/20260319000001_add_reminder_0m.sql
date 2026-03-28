-- ************ By Inova Digital Marketing ***************
-- ******************* inovamkt.io ************************
-- ******************* Paulo Daian ************************
-- *************** contact@inovamkt.io ******************

-- Add exact time (0m) reminder column to appointment_settings table
ALTER TABLE public.appointment_settings ADD COLUMN IF NOT EXISTS reminder_0m_template_id UUID REFERENCES public.message_templates(id) ON DELETE SET NULL;
