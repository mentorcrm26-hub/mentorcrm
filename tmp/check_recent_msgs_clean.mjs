import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data: messages, error } = await supabase
        .from('messages')
        .select('content, created_at, source, status')
        .order('created_at', { ascending: false })
        .limit(10);
        
    messages.forEach(m => {
        console.log(`[${m.created_at}] [${m.source}] [${m.status}] -> ${m.content.substring(0, 100).replace(/\n/g, ' ')}...`);
    });
}
check();
