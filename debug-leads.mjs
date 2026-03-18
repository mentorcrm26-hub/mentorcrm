import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkLeads() {
  const { data, error } = await supabase.from('leads').select('name, meeting_at, google_event_id').limit(20)
  if (error) console.error(error)
  else console.table(data)
}

checkLeads()
