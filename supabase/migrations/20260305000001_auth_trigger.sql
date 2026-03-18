-- 6. AUTH TRIGGER FOR MENTOR CRM
-- Automatiza a criação do Tenant e do Perfil de Usuário assim que o cadastro é feito.

create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_tenant_id uuid;
  user_full_name text;
begin
  -- Pega o nome do metadata ou usa um padrão
  user_full_name := coalesce(new.raw_user_meta_data->>'full_name', 'Novo Usuário');

  -- Cria um Tenant (Workspace) restrito de Trial de 3 Dias
  insert into public.tenants (name, status)
  values (user_full_name || ' Workspace', 'trial')
  returning id into new_tenant_id;

  -- Cria o perfil de usuário (Agent/Admin) atrelado ao Tenant
  insert into public.users (id, tenant_id, role, full_name)
  values (new.id, new_tenant_id, 'admin', user_full_name);

  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
