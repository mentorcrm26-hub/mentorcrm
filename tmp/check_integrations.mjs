import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    console.log('--- INTEGRATIONS (WHATSAPP) ---');
    const { data, error } = await sb
        .from('integrations')
        .select('*')
        .eq('provider', 'whatsapp')
        .limit(1);

    if (error) {
        console.error('Erro:', error);
        return;
    }

    console.log(JSON.stringify(data, null, 2));
}

main();
