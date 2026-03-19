import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    console.log('--- ÚLTIMOS DOCUMENTOS NO BANCO ---');
    const { data } = await sb
        .from('messages')
        .select('media_url, content, created_at, direction')
        .eq('media_type', 'document')
        .order('created_at', { ascending: false })
        .limit(3);

    console.log(JSON.stringify(data, null, 2));
}

main();
