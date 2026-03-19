import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    console.log('--- ÚLTIMAS 10 MENSAGENS (ANY TIME) ---');
    const { data, error } = await sb
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Erro:', error);
        return;
    }

    data.forEach((m, i) => {
        console.log(`[${i}] Data: ${m.created_at} | Direção: ${m.direction}`);
        console.log(`    Conteúdo: ${m.content}`);
        console.log(`    Media URL: ${m.media_url}`);
        console.log('---');
    });
}

main();
