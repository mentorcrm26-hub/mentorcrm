import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    console.log('--- ÚLTIMAS 5 MENSAGENS COM MÍDIA ---');
    const { data, error } = await sb
        .from('messages')
        .select('content, media_url, media_type, direction, created_at')
        .eq('direction', 'inbound')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Erro:', error);
        return;
    }

    console.log(JSON.stringify(data, null, 2));
}

main();
