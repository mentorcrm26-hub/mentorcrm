import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function makeSuperAdmin() {
  const email = 'mentorcrm26@gmail.com';
  console.log(`Buscando usuário: ${email}...`);
  
  const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
  
  if (userError) {
    console.error('Erro na busca de usuários:', userError);
    process.exit(1);
  }
  
  const user = userData.users.find(u => u.email === email);
  
  if (!user) {
    console.error(`O usuário ${email} não foi encontrado. Cadastre-o primeiro.`);
    process.exit(1);
  }
  
  console.log(`Adicionando o UUID ${user.id} na tabela system_admins...`);
  
  const { error: insertError } = await supabase
    .from('system_admins')
    .upsert({ id: user.id });
    
  if (insertError) {
    console.error('Falhou ao adicionar privilégio de Super Admin:', insertError);
  } else {
    console.log(`[SUCESSO] ${email} agora é um Super Admin do Mentor CRM!`);
  }
}

makeSuperAdmin();
