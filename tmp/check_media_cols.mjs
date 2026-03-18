import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// Use Supabase Management API to run arbitrary SQL
async function runSQL(sql) {
  // Extract project ref from URL
  const urlMatch = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)
  if (!urlMatch) {
    console.log('Not a remote Supabase project. URL:', SUPABASE_URL)
    // Try using the pg endpoint directly
    const res = await fetch(`${SUPABASE_URL}/pg`, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({ query: sql })
    })
    console.log('PG status:', res.status)
    const text = await res.text()
    console.log('PG response:', text.slice(0, 200))
    return
  }

  const projectRef = urlMatch[1]
  console.log('Project ref:', projectRef)
}

async function addMediaColumns() {
  const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  // Insert a test row to messages with media_url to trigger the column addition
  // If column doesn't exist, we need to add it through another method

  // Check if column exists first
  const { error: checkErr } = await sb.from('messages').select('media_url').limit(1)
  
  if (!checkErr) {
    console.log('✅ media_url column ALREADY EXISTS!')
    return
  }

  console.log('Column missing. Error:', checkErr.message)
  console.log('\n📋 Please run this SQL in your Supabase Dashboard > SQL Editor:')
  console.log('─'.repeat(60))
  console.log('ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS media_url TEXT;')
  console.log('ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS media_type TEXT;')
  console.log('─'.repeat(60))
}

addMediaColumns()
