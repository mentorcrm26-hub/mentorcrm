-- ************ By Inova Digital Marketing ***************
-- ******************* inovamkt.io ************************
-- ******************* Paulo Daian ************************
-- *************** contact@inovamkt.io ******************

-- MIGRATION: Fix native tags for new tenants
-- 1. Seed native tags for any tenants that don't have them yet (created after 20260328120000)
INSERT INTO public.tags (tenant_id, name, color_hex, is_native)
SELECT t.id, 'Closed', '#10b981', true
FROM public.tenants t
WHERE NOT EXISTS (
    SELECT 1 FROM public.tags WHERE tenant_id = t.id AND name = 'Closed'
);

INSERT INTO public.tags (tenant_id, name, color_hex, is_native)
SELECT t.id, 'Lost', '#ef4444', true
FROM public.tenants t
WHERE NOT EXISTS (
    SELECT 1 FROM public.tags WHERE tenant_id = t.id AND name = 'Lost'
);

-- 2. Update the auth trigger to seed native tags on every new tenant
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_tenant_id uuid;
  user_full_name text;
BEGIN
  user_full_name := COALESCE(new.raw_user_meta_data->>'full_name', 'Novo Usuário');

  INSERT INTO public.tenants (name, status)
  VALUES (user_full_name || ' Workspace', 'trial')
  RETURNING id INTO new_tenant_id;

  INSERT INTO public.users (id, tenant_id, role, full_name)
  VALUES (new.id, new_tenant_id, 'admin', user_full_name);

  -- Seed native tags for the new tenant
  INSERT INTO public.tags (tenant_id, name, color_hex, is_native)
  VALUES
    (new_tenant_id, 'Closed', '#10b981', true),
    (new_tenant_id, 'Lost',   '#ef4444', true);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
