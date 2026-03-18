import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkRPC() {
  console.log('--- Checking increment_unread_count RPC ---')
  // Try to call it with a fake ID
  const { error } = await supabase.rpc('increment_unread_count', { conv_id: '00000000-0000-0000-0000-000000000000' })
  
  if (error && error.message.includes('does not exist')) {
    console.error('RPC increment_unread_count DOES NOT EXIST')
  } else if (error) {
    console.log('RPC exists but failed (expectedly):', error.message)
  } else {
    console.log('RPC exists and succeeded (surprising if ID is fake)')
  }
}

checkRPC()
