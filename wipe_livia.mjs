import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function wipe() {
    await supabase.from('leads').update({ meeting_notified: {} }).eq('name', 'Livia Maria');
    console.log('Wiped Livia Maria meeting_notified!');
}
wipe();
