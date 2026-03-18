import { createClient } from '@supabase/supabase-js';

// Configuration from .env.local
const SUPABASE_URL = 'https://kmmqiwfsikspetquhmev.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttbXFpd2ZzaWtzcGV0cXVobWV2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc2ODMzNywiZXhwIjoyMDg4MzQ0MzM3fQ.zUPkoh18LT9RyoNu3c99o4B4xUHiA4iYnVlK4LXMhfk';

async function test() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  // 1. Get a valid integration
  const { data: integrations, error } = await supabase
    .from('integrations')
    .select('tenant_id, credentials')
    .eq('provider', 'whatsapp')
    .limit(1);

  if (error || !integrations || integrations.length === 0) {
    console.error('Error fetching integrations:', error || 'No integrations found');
    return;
  }

  const integration = integrations[0];
  const tenantId = integration.tenant_id;
  const creds = integration.credentials;
  const instanceName = (typeof creds === 'object' ? (creds.instanceName || creds.instance) : String(creds)) || 'unknown';

  console.log(`Using Tenant: ${tenantId}, Instance: ${instanceName}`);
  
  // --- TEST INBOUND ---
  const inboundId = "TEST_IN_" + Date.now();
  const inboundPayload = {
    event: "messages.upsert",
    instance: instanceName,
    data: {
      key: { remoteJid: "5511988887777@s.whatsapp.net", fromMe: false, id: inboundId },
      message: { conversation: "Teste Inbound" },
      messageTimestamp: Math.floor(Date.now() / 1000),
      pushName: "Tester Inbound"
    }
  };

  console.log('Sending mock INBOUND webhook...');
  await fetch('http://localhost:3000/api/webhooks/evolution', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inboundPayload)
  });

  // --- TEST OUTBOUND ---
  const outboundId = "TEST_OUT_" + Date.now();
  const outboundPayload = {
    event: "messages.upsert",
    instance: instanceName,
    data: {
      key: { remoteJid: "5511988887777@s.whatsapp.net", fromMe: true, id: outboundId },
      message: { conversation: "Teste Outbound (Sync from Phone)" },
      messageTimestamp: Math.floor(Date.now() / 1000)
    }
  };

  console.log('Sending mock OUTBOUND webhook...');
  await fetch('http://localhost:3000/api/webhooks/evolution', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(outboundPayload)
  });

  console.log('Verifying in database...');
  await new Promise(r => setTimeout(r, 2000));

  // Check Inbound
  const { data: inMsg } = await supabase.from('messages').select('*').eq('evolution_message_id', inboundId).maybeSingle();
  if (inMsg) console.log('✅ INBOUND SUCCESS');
  else console.log('❌ INBOUND FAILURE');

  // Check Outbound
  const { data: outMsg } = await supabase.from('messages').select('*').eq('evolution_message_id', outboundId).maybeSingle();
  if (outMsg) console.log('✅ OUTBOUND SUCCESS');
  else console.log('❌ OUTBOUND FAILURE');
}

test();
