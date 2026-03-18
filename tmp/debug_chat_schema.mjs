import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testSchema() {
  console.log('--- Testing Conversations Table ---')
  const { data: conv, error: convErr } = await supabase.from('conversations').select('*').limit(1)
  if (convErr) console.error('Conversations Error:', convErr)
  else console.log('Conversations Table exists')

  console.log('--- Testing Messages Table ---')
  const { data: msg, error: msgErr } = await supabase.from('messages').select('*').limit(1)
  if (msgErr) console.error('Messages Error:', msgErr)
  else console.log('Messages Table exists')

  console.log('--- Testing Lead Search ---')
  const { data: leads, error: leadsErr } = await supabase
    .from('leads')
    .select('id, name, phone')
    .limit(5)
  
  if (leadsErr) console.error('Leads Error:', leadsErr)
  else {
    console.log('Leads found:', leads)
    if (leads.length > 0) {
        const phone = leads[0].phone?.replace(/\D/g, '')
        if (phone) {
            const shortPhone = phone.length > 10 ? phone.slice(-10) : phone
            const { data: match } = await supabase.from('leads').select('name').ilike('phone', `%${shortPhone}%`).single()
            console.log(`Search match for ${shortPhone}:`, match?.name || 'No match')
        }
    }
  }
}

testSchema()
