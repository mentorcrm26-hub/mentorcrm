import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    const { data: integrations, error } = await sb
        .from('integrations')
        .select('*');

    if (error) {
        console.error('Erro:', error);
        return;
    }

    console.log('--- INTEGRAÇÕES CONFIGURADAS ---');
    integrations.forEach(i => {
        console.log(`ID: ${i.id} | Provider: ${i.provider} | Active: ${i.is_active} | Credentials: ${JSON.stringify(i.credentials)}`);
    });
}

main();
