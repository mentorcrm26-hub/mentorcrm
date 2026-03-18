import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const tenantId = 'c906a6d3-f02c-4378-b053-0f3b8fa4b3d6'

async function testSearch(phone) {
  const cleaned = phone.replace(/\D/g, '')
  const suffix = cleaned.slice(-8)
  console.log(`Searching for phone: ${phone} -> Cleaned: ${cleaned} -> Suffix: ${suffix}`)
  
  const { data, error } = await sb.from('leads')
    .select('id, name, phone')
    .eq('tenant_id', tenantId)
    .ilike('phone', `%${suffix}%`)
    
  if (error) {
    console.error('Error:', error)
  } else {
    console.log(`Found ${data.length} leads:`, data)
  }
}

async function run() {
  await testSearch('5511999999999')
  await testSearch('14077472138')
  await testSearch('(40) 7254-1236')
}

run()
