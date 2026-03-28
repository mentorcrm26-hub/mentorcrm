-- ************ By Inova Digital Marketing ***************
-- ******************* inovamkt.io ************************
-- ******************* Paulo Daian ************************
-- *************** contact@inovamkt.io ******************


-- ADD UNIQUE CONSTRAINT TO evolution_message_id TO SUPPORT UPSERT
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'messages_evolution_id_unique'
    ) THEN
        ALTER TABLE public.messages ADD CONSTRAINT messages_evolution_id_unique UNIQUE (evolution_message_id);
    END IF;
END $$;
