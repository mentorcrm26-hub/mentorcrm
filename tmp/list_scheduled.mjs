import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data: leads, error } = await supabase
        .from('leads')
        .select('*, tenant:tenants(id, name)')
        .not('meeting_at', 'is', null)
        .eq('status', 'Scheduled');
        
    console.log(`Found ${leads?.length || 0} scheduled leads.`);
    
    if (leads?.length) {
        for (const l of leads) {
            console.log(`- ${l.name}: meeting_at=${l.meeting_at}, notified=${JSON.stringify(l.meeting_notified)}, phone=${l.phone}`);
        }
    }
}
check();
