import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('status', 'Scheduled')
        .limit(10);
    
    if (error) console.error(error);
    else {
        const livia = data.find(l => l.name?.includes('Livia') || l.name?.includes('Maria'));
        if (livia) {
            console.log('Found Livia:');
            console.log('ID:', livia.id);
            console.log('Phone:', livia.phone);
            console.log('Meeting At (Raw DB):', livia.meeting_at);
            console.log('Meeting Notified:', livia.meeting_notified);
        } else {
            console.log('Livia not found in Scheduled leads. Scheduled leads:');
            console.log(data.map(l => ({ name: l.name, meeting_at: l.meeting_at })));
        }
    }
}
check();
