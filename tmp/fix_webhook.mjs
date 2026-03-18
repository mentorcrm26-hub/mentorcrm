import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const EVOLUTION_URL = process.env.EVOLUTION_API_URL
const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY
const APP_URL = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

console.log('EVOLUTION_URL:', EVOLUTION_URL)
console.log('APP_URL:', APP_URL)

const { data: integrations } = await sb.from('integrations').select('id, credentials').eq('provider', 'whatsapp')
console.log('Integrations found:', integrations?.length)
if (!integrations?.length) { console.log('NONE found'); process.exit(1) }

for (const i of integrations) {
  const name = i.credentials?.instanceName
  console.log('Instance:', name)
  const url = `${EVOLUTION_URL}/webhook/set/${name}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': EVOLUTION_KEY },
    body: JSON.stringify({ webhook: { enabled: true, url: `${APP_URL}/api/webhooks/evolution`, webhookByEvents: false, webhookBase64: true, events: ['MESSAGES_UPSERT'] } })
  })
  const txt = await res.text()
  console.log(`Result [${res.status}]:`, txt.slice(0, 400))
}
