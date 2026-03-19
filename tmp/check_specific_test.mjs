import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSpecific() {
    console.log('--- BUSCANDO QUALQUER COISA COM "777" ---');
    const { data, error } = await sb
        .from('messages')
        .select('id, content, direction, evolution_message_id, created_at')
        .ilike('content', '%777%');

    if (error) {
        console.error('Erro:', error);
    } else {
        console.log('Resultados:', data.length);
        console.log(JSON.stringify(data, null, 2));
    }
}

checkSpecific();
