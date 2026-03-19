import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    console.log('--- BUSCANDO MENSAGENS INBOUND NO SUPABASE ---');
    const { data } = await sb
        .from('messages')
        .select('*')
        .eq('direction', 'inbound')
        .ilike('media_url', '%supabase.co%')
        .order('created_at', { ascending: false });

    console.log(`Encontradas: ${data?.length || 0}`);
    if (data && data.length > 0) {
        data.forEach(m => {
            console.log(`[${m.created_at}] Type: ${m.media_type} | URL: ${m.media_url.substring(0, 50)}...`);
        });
    }
}

main();
