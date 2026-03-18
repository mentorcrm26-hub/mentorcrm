import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debug() {
  console.log('Checking columns for table automations...')
  // Using a query that involves the column to see if it fails
  const { data, error } = await supabase
    .from('automations')
    .select('template')
    .limit(1)

  if (error) {
    console.error('Error selecting template column:', error.message)
    if (error.message.includes('column "template" does not exist')) {
      console.log('🔴 COLUMN "template" DOES NOT EXIST.')
    }
  } else {
    console.log('🟢 Column "template" exists in the API.')
  }
}

debug()
