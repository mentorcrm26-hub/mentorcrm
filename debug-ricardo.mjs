import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function findRicardo() {
  const { data, error } = await supabase.from('leads').select('*').ilike('name', '%Ricardo%')
  if (error) console.error(error)
  else console.table(data)
}

findRicardo()
