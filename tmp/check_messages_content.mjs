import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    const { data: messages, error } = await sb
        .from('messages')
        .select('content, direction, evolution_message_id, created_at, source')
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error('Erro:', error);
        return;
    }

    console.log('--- ÚLTIMAS 20 MENSAGENS (DIAGNÓSTICO FINAL) ---');
    messages.forEach(m => {
        console.log(`[${m.created_at}] [${m.source || 'LEGADO'}] ${m.direction}: "${m.content?.substring(0, 30)}" | ID: ${m.evolution_message_id}`);
    });
}

main();
