import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data: lead } = await supabase.from('leads').select('name, phone, tenant_id').eq('name', 'Livia Maria').single();
    if (lead) {
        console.log('Livia Maria:', lead);
    }
}
check();
