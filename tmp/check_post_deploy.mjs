import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    console.log('--- BUSCANDO MENSAGENS PÓS-DEPLOY (03:29 UTC / 23:29 LOCAL) ---');
    const { data, error } = await sb
        .from('messages')
        .select('*')
        .gt('created_at', '2026-03-19T03:29:00+00:00')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Erro:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log(`--- ${data.length} NOVAS MENSAGENS ENCONTRADAS ---`);
        data.forEach((m, i) => {
            console.log(`[${i}] Direção:`, m.direction);
            console.log(`[${i}] Conteúdo:`, m.content);
            console.log(`[${i}] Media URL:`, m.media_url);
        });
    } else {
        console.log('Nenhuma mensagem encontrada após o deploy.');
    }
}

main();
