import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    const { data: messages, error } = await sb
        .from('messages')
        .select('content, direction, evolution_message_id, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Erro:', error);
        return;
    }

    const targets = ['oi', 'kkk'];
    const results = messages.filter(m => {
        const c = m.content?.toLowerCase() || '';
        return targets.some(t => c === t || c.includes(t));
    });

    console.log('--- RELATÓRIO DE MENSAGENS (Oi/Kkk) ---');
    results.forEach(m => {
        console.log(`[${m.created_at}] Conteúdo: "${m.content}" | Direção: ${m.direction} | ID: ${m.evolution_message_id || 'NULO'}`);
    });
}

main();
