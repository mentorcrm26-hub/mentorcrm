import { WhatsAppService } from './src/lib/whatsapp-service.js';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

async function test() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data: lead } = await supabase.from('leads').select('*').eq('name', 'Daian - Lead').single();
    
    if (lead) {
        console.log('Sending to:', lead.phone);
        const wa = new WhatsAppService(lead.tenant_id);
        const res = await wa.sendMessage(lead.phone, "TEST CRON");
        console.log('Result:', res);
    }
}
test();
