import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function debugIntegrations() {
  const { data, error } = await sb
    .from('integrations')
    .select('*')
    .eq('provider', 'whatsapp')
    
  if (error) {
    console.error('Error:', error)
    return
  }
  
  console.log('Integrations:', JSON.stringify(data, null, 2))
}

debugIntegrations()
