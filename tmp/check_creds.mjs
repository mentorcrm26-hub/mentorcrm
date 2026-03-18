import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function check() {
  const { data } = await sb.from('integrations').select('*').eq('provider', 'whatsapp')
  if (!data) return
  
  data.forEach(i => {
    console.log(`Tenant: ${i.tenant_id}`)
    console.log(`Creds (tipo ${typeof i.credentials}):`, i.credentials)
    console.log('---')
  })
}

check()
