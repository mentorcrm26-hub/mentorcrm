import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function run() {
  // Test if media_url already exists
  const { data, error } = await sb.from('messages').select('media_url').limit(1)
  if (error && error.message.includes('column') && error.message.includes('does not exist')) {
    console.log('Column media_url MISSING. Adding now...')
    // Use admin client to run raw SQL via pg REST
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        sql: `ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS media_url TEXT; ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS media_type TEXT;`
      })
    })
    console.log('SQL result status:', res.status)
  } else if (error) {
    console.error('Unexpected error:', error.message)
  } else {
    console.log('✅ media_url column already exists!')
  }
}

run().catch(console.error)
