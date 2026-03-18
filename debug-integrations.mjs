import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkIntegrations() {
  const { data, error } = await supabase.from('system_integrations').select('*')
  if (error) console.error(error)
  else console.log(JSON.stringify(data, null, 2))
}

checkIntegrations()
