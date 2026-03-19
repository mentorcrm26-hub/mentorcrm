import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSpecific() {
    console.log('--- BUSCANDO QUALQUER "BUG-TESTE-999" ---');
    const { data, error } = await sb
        .from('messages')
        .select('*')
        .ilike('content', '%BUG-TESTE-999%');

    if (error) {
        console.error('Erro:', error);
    } else {
        console.log('Resultados:', data.length);
        console.log(JSON.stringify(data, null, 2));
    }
}

checkSpecific();
