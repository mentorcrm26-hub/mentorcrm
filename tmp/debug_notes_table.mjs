import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role to bypass RLS for debugging

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debug() {
  console.log('Checking table lead_notes...')
  const { data, error } = await supabase
    .from('lead_notes')
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.error('Error checking table:', error.message)
    if (error.message.includes('relation "public.lead_notes" does not exist')) {
      console.log('🔴 TABLE DOES NOT EXIST. User needs to run the SQL migration.')
    }
  } else {
    console.log('🟢 Table exists.')
  }
}

debug()
