import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const { data, error } = await sb.from('integrations').select('id, provider, credentials, is_active').eq('provider', 'whatsapp')
if (error) { console.error(error); process.exit(1) }

for (const row of data) {
  console.log('--- Integration ---')
  console.log('ID:', row.id)
  console.log('Provider:', row.provider)
  console.log('is_active:', row.is_active)
  console.log('credentials.status:', row.credentials?.status)
  console.log('credentials.instanceName:', row.credentials?.instanceName)
}
