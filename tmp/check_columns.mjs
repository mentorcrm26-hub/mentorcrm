import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    console.log('--- COLUNAS DA TABELA MESSAGES ---');
    const { data, error } = await sb
        .from('messages')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Erro:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('Colunas encontradas:', Object.keys(data[0]));
    } else {
        console.log('Nenhuma mensagem encontrada para verificar colunas.');
    }
}

main();
