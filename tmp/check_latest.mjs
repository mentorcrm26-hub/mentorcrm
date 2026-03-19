import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    console.log('--- ÚLTIMAS 5 MENSAGENS NO BANCO ---');
    const { data, error } = await sb
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Erro:', error);
        return;
    }

    data.forEach((m, i) => {
        console.log(`[${i}] Data:`, m.created_at);
        console.log(`[${i}] Direção:`, m.direction);
        console.log(`[${i}] Conteúdo:`, m.content);
        console.log(`[${i}] Media URL:`, m.media_url);
        console.log('---');
    });
}

main();
