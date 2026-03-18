import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kmmqiwfsikspetquhmev.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttbXFpd2ZzaWtzcGV0cXVobWV2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc2ODMzNywiZXhwIjoyMDg4MzQ0MzM3fQ.zUPkoh18LT9RyoNu3c99o4B4xUHiA4iYnVlK4LXMhfk';

async function debug() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  console.log('--- DEBUGGING LEAD FOR DAIAN ---');
  const { data: leads, error: leadErr } = await supabase
    .from('leads')
    .select('*, conversations(*)')
    .ilike('name', '%DAIAN%');

  if (leadErr) {
    console.error('Error fetching lead:', leadErr);
    return;
  }

  console.log('Leads found:', JSON.stringify(leads, null, 2));

  // Also check integrations
  const { data: ints } = await supabase
    .from('integrations')
    .select('*')
    .eq('provider', 'whatsapp');
  
  console.log('Integrations:', JSON.stringify(ints, null, 2));

  // Simulate hit for the real number
  const payload = {
    event: "messages.upsert",
    instance: "CRM",
    data: {
      key: {
        remoteJid: "14077473001@s.whatsapp.net",
        fromMe: false,
        id: "DEBUG_REAL_" + Date.now()
      },
      message: {
        conversation: "Teste Debug Antigravity"
      },
      messageTimestamp: Math.floor(Date.now() / 1000),
      pushName: "Daian"
    }
  };

  console.log('Simulating real-number webhook hit...');
  const res = await fetch('http://localhost:3000/api/webhooks/evolution', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  console.log('Response:', await res.json());
}

debug();
