-- ************ By Inova Digital Marketing ***************
-- ******************* inovamkt.io ************************
-- ******************* Paulo Daian ************************
-- *************** contact@inovamkt.io ******************

-- Add phone column to public.users and update trigger to capture it from metadata

-- 1. Add column
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;

-- 2. Update the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_tenant_id uuid;
  user_full_name text;
  user_phone text;
BEGIN
  -- Capture data from metadata
  user_full_name := coalesce(new.raw_user_meta_data->>'full_name', 'Novo Usuário');
  user_phone := new.raw_user_meta_data->>'phone';

  -- Create Tenant
  INSERT INTO public.tenants (name, status)
  VALUES (user_full_name || ' Workspace', 'trial')
  RETURNING id INTO new_tenant_id;

  -- Create Profile with phone
  INSERT INTO public.users (id, tenant_id, role, full_name, phone, email)
  VALUES (new.id, new_tenant_id, 'admin', user_full_name, user_phone, new.email);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
