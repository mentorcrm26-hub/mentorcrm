import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    // Get Livia's ID first
    const { data: lead } = await supabase.from('leads').select('id').eq('name', 'Livia Maria').single();
    if (!lead) {
        console.log('Lead not found');
        return;
    }

    // Get conversation for this lead
    const { data: conv } = await supabase.from('conversations').select('id').eq('lead_id', lead.id).single();
    if (!conv) {
        console.log('Conversation not found');
        return;
    }

    // Get recent messages for this conversation
    const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(5);

    console.log(`Found ${messages?.length || 0} recent messages for Livia Maria:`);
    messages?.forEach(m => {
        console.log(`[${m.created_at}] [${m.status}] [ID: ${m.evolution_message_id}] -> ${m.content.substring(0, 50)}...`);
    });
}
check();
