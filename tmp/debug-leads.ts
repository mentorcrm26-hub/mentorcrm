
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl!, supabaseKey!)

async function debug() {
  const { data: users } = await supabase.from('users').select('id').ilike('full_name', '%Paulo Daian%')
  if (!users?.[0]) { console.log('USER_NOT_FOUND'); return }
  const agentId = users[0].id
  const { data: leads } = await supabase.from('leads').select('name, is_archived').eq('assigned_to', agentId)
  
  console.log('AGENT_ID:', agentId)
  leads?.forEach(l => console.log(`LEAD: ${l.name} | ARCHIVED: ${l.is_archived}`))
  console.log('TOTAL_COUNT:', leads?.length)
}

debug()
