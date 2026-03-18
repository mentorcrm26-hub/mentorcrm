import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getColumns() {
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'messages' })
  if (error) {
      // If RPC doesn't exist, try a simple query and look at the keys of the first row
      const { data: rows } = await supabase.from('messages').select('*').limit(1)
      if (rows && rows.length > 0) {
          console.log('Columns in messages:', Object.keys(rows[0]))
      } else {
          console.error('No rows found in messages to determine columns')
      }
  } else {
      console.log('Columns in messages:', data)
  }
}

getColumns()
