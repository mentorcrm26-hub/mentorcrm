import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function checkMessages() {
  const { data, error } = await sb
    .from('messages')
    .select('*')
    .eq('direction', 'inbound')
    .order('created_at', { ascending: false })
    .limit(5)
    
  if (error) {
    console.error('Error fetching messages:', error)
    return
  }
  
  console.log('Recent Inbound Messages:', JSON.stringify(data, null, 2))
}

checkMessages()
