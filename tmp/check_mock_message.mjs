import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    console.log('--- BUSCANDO MOCK DE MÍDIA ---');
    const { data, error } = await sb
        .from('messages')
        .select('*')
        .ilike('evolution_message_id', '%MOCK_MEDIA_ID_%')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Erro:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log(`--- ${data.length} MOCKS ENCONTRADOS ---`);
        data.forEach((m, i) => {
            console.log(`[${i}] ID:`, m.id);
            console.log(`[${i}] Evolution ID:`, m.evolution_message_id);
            console.log(`[${i}] Media URL:`, m.media_url);
            console.log(`[${i}] Content:`, m.content);
        });
        console.log('--- FIM ---');
    } else {
        console.log('Mock não encontrado no banco.');
    }
}

main();
