import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    const twentyMinsAgo = new Date(Date.now() - 20 * 60 * 1000).toISOString();
    console.log(`--- CONVERSAS ATUALIZADAS DESDE ${twentyMinsAgo} ---`);
    const { data: convs, error } = await sb
        .from('conversations')
        .select('*')
        .gt('updated_at', twentyMinsAgo);

    if (error) {
        console.error('Erro:', error);
        return;
    }

    console.log(`Resultados: ${convs.length}`);
    convs.forEach(c => {
        console.log(`ID: ${c.id} | Lead ID: ${c.lead_id} | Last Text: "${c.last_message_content}" | Updated At: ${c.updated_at}`);
    });
}

main();
