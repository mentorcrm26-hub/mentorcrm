import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
    const { data: lead } = await supabase.from('leads').select('*').eq('name', 'Daian - Lead').single();
    
    if (lead) {
        console.log('Sending to:', lead.phone);
        
        const { data: integration } = await supabase
            .from('integrations')
            .select('credentials')
            .eq('tenant_id', lead.tenant_id)
            .eq('provider', 'whatsapp')
            .single();

        const instanceName = integration.credentials.instanceName;
        console.log('Instance Name:', instanceName);
        
        const url = `https://inovamkt-evolution-api.b4jfas.easypanel.host/message/sendText/${instanceName}`;
        
        let cleanPhone = lead.phone.replace(/\D/g, '');
        if (cleanPhone.length === 10) cleanPhone = `1${cleanPhone}`;
        
        const body = {
            number: cleanPhone,
            text: "Testing delivery...",
            options: { delay: 1200, presence: 'composing' }
        };
        
        const fetch = (await import('node-fetch')).default;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': process.env.EVOLUTION_API_KEY
            },
            body: JSON.stringify(body)
        });
        
        const data = await res.json();
        console.log('Evolution API Response:', data);
    }
}
test();
