import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function listTables() {
  const { data, error } = await sb.rpc('exec_sql', { 
    sql_query: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'" 
  }).catch(() => ({ data: null, error: 'RPC exec_sql probably not enabled' }))
  
  if (data) {
    console.log('Tables:', data.map(t => t.table_name))
  } else {
    // Alternative: Try to select from common tables
    console.log('Could not list via RPC. Investigating migrations...')
  }
}

listTables()
