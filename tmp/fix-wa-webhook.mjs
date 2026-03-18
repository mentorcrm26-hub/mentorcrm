import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const EVOLUTION_URL = process.env.EVOLUTION_API_URL
const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.mentorcrm.site'

const sb = createClient(SUPABASE_URL, SERVICE_KEY)

async function fixWebhook() {
  console.log('--- FIXING WHATSAPP WEBHOOK ---')
  const { data: integrations, error } = await sb
    .from('integrations')
    .select('*')
    .eq('provider', 'whatsapp')

  if (error || !integrations?.length) {
    console.error('❌ No integrations found')
    return
  }

  for (const integration of integrations) {
    const instanceName = integration.credentials?.instanceName
    if (!instanceName) continue

    const webhookUrl = `${APP_URL.replace(/\/$/, '')}/api/webhooks/evolution`
    console.log(`🔧 Configuring instance: ${instanceName}`)
    console.log(`   Webhook URL: ${webhookUrl}`)

    const payload = {
      webhook: {
        enabled: true,
        url: webhookUrl,
        webhookByEvents: false,
        webhookBase64: true,
        events: [
          "MESSAGES_UPSERT",
          "MESSAGES_UPDATE",
          "MESSAGES_DELETE",
          "SEND_MESSAGE",
          "CONTACTS_UPSERT",
          "CONTACTS_UPDATE",
          "PRESENCE_UPDATE",
          "CHATS_UPSERT",
          "CHATS_UPDATE",
          "CHATS_DELETE"
        ]
      }
    }

    try {
      const res = await fetch(`${EVOLUTION_URL}/webhook/set/${instanceName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_KEY
        },
        body: JSON.stringify(payload)
      })

      const result = await res.json()
      if (res.ok) {
        console.log(`✅ SUCCESS for ${instanceName}`)
      } else {
        console.error(`❌ FAILED for ${instanceName}:`, result)
      }
    } catch (err) {
      console.error(`❌ ERROR connecting to Evolution API: ${err.message}`)
    }
  }
}

fixWebhook()
