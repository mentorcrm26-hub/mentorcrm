import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const instanceName = 'CRM'

async function debugMatch() {
  const { data: allIntegrations } = await sb.from('integrations').select('tenant_id, credentials').eq('provider', 'whatsapp')
  
  if (!allIntegrations) {
    console.log('No integrations found')
    return
  }

  console.log('Integrations found:', allIntegrations.length)
  
  const match = allIntegrations.find((i) => {
    const creds = i.credentials;
    console.log(`Checking tenant ${i.tenant_id} with creds:`, creds);
    const savedInstance = (typeof creds === 'object' ? creds.instanceName : String(creds)) || '';
    console.log(`Saved instance: "${savedInstance}", Received: "${instanceName}"`);
    return savedInstance.toLowerCase() === instanceName.toLowerCase();
  });

  if (match) {
    console.log('MATCH FOUND! Tenant ID:', match.tenant_id)
  } else {
    console.log('NO MATCH FOUND')
  }
}

debugMatch()
