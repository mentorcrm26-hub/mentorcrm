import { WhatsAppService } from '../src/lib/whatsapp-service';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verify() {
    console.log('--- VERIFICATION START ---');
    
    // 1. Get a test lead
    const { data: lead } = await supabase
        .from('leads')
        .select('phone, tenant_id')
        .limit(1)
        .single();
    
    if (!lead) {
        console.error('No lead found for testing');
        return;
    }

    console.log(`Testing with lead phone: ${lead.phone} | Tenant: ${lead.tenant_id}`);

    const service = new WhatsAppService(lead.tenant_id);
    const testId = "VERIFY_FIX_" + Date.now();

    // 2. Test logMessage for INBOUND
    console.log('Logging mock INBOUND message...');
    await service.logMessage(lead.phone, "Teste Inbound Fix", "inbound", testId);

    // 3. Verify in DB
    await new Promise(r => setTimeout(r, 2000));
    const { data: msg, error } = await supabase
        .from('messages')
        .select('*')
        .eq('evolution_message_id', testId)
        .maybeSingle();

    if (error) {
        console.error('DB Error:', error.message);
    } else if (msg) {
        console.log('✅ VERIFICATION SUCCESS!');
        console.log('Saved Message Details:');
        console.log(`- ID: ${msg.id}`);
        console.log(`- Direction: ${msg.direction} (Expected: inbound)`);
        console.log(`- Content: ${msg.content}`);
        console.log(`- Evolution ID: ${msg.evolution_message_id}`);
        
        if (msg.direction === 'inbound' && msg.evolution_message_id === testId) {
            console.log('🎉 DIRECTION AND ID ARE CORRECT!');
        } else {
            console.log('❌ DIRECTION OR ID INCORRECT');
        }
    } else {
        console.log('❌ MESSAGE NOT FOUND IN DB');
    }
}

verify();
