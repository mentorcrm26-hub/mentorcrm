require('dotenv').config({ path: '.env.local' });
// Removed node-fetch

const apiUrl = process.env.EVOLUTION_API_URL.replace(/\/manager$/, '');
const apikey = process.env.EVOLUTION_API_KEY;

async function testFetch() {
  const instanceName = 'MentorCRM_DEV'; // I need to get the real instance name
  // Let's get the active integration to find instanceName
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  const { data: ints } = await supabase.from('integrations').select('credentials').eq('provider', 'whatsapp');
  if (!ints || ints.length === 0) return console.log('No integrations found');
  
  const instance = ints[0].credentials.instanceName || ints[0].credentials.instance;
  console.log('Testing instance:', instance);
  
  // Use the ID from the previous output: 
  // Wait, the id from the message table is the UUID in our db.
  // The evolution_message_id is what we need.
  const { data: msg } = await supabase.from('messages').select('evolution_message_id').eq('id', 'ad9c8282-d3d5-4880-a2a6-7dc49241d081').single();
  const evoId = msg.evolution_message_id;
  
  console.log('Fetching base64 for Evolution Msg ID:', evoId);
  
  const res = await fetch(`${apiUrl}/chat/getBase64FromMediaMessage/${instance}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey },
    // A lot of times we need to pass the full raw message. But we didn't store it!
    // Let's just pass what we passed in webhook:
    body: JSON.stringify({
      message: {
        key: {
          id: evoId
        }
      }
    })
  });
  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Response:', text.slice(0, 300));
}

testFetch();
