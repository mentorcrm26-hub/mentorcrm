/**
 * Script to reconfigure Evolution API webhook with webhookBase64: true
 * so inbound media (images, videos, documents) are included in webhook payload
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const EVOLUTION_URL = process.env.EVOLUTION_API_URL
const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY
const APP_URL = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

const sb = createClient(SUPABASE_URL, SERVICE_KEY)

async function reconfigureWebhook() {
  console.log('🔍 Finding WhatsApp integrations...')
  const { data: integrations, error } = await sb
    .from('integrations')
    .select('id, tenant_id, credentials')
    .eq('provider', 'whatsapp')

  if (error || !integrations?.length) {
    console.error('❌ No integrations found:', error?.message)
    return
  }

  console.log(`✅ Found ${integrations.length} integration(s)\n`)

  for (const integration of integrations) {
    const creds = integration.credentials
    const instanceName = creds?.instanceName
    if (!instanceName) {
      console.log(`⚠️  Skipping integration ${integration.id} — no instanceName`)
      continue
    }

    console.log(`\n🔧 Reconfiguring webhook for instance: ${instanceName}`)
    const webhookUrl = `${APP_URL}/api/webhooks/evolution`

    const payload = {
      webhook: {
        enabled: true,
        url: webhookUrl,
        webhookByEvents: false,
        webhookBase64: true,       // ← KEY CHANGE: include media as base64
        events: ['MESSAGES_UPSERT']
      }
    }

    const res = await fetch(`${EVOLUTION_URL}/webhook/set/${instanceName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_KEY
      },
      body: JSON.stringify(payload)
    })

    const text = await res.text()
    if (res.ok) {
      console.log(`✅ Webhook updated for '${instanceName}'! webhookBase64 = true`)
      console.log(`   URL: ${webhookUrl}`)
    } else {
      console.error(`❌ Failed (${res.status}): ${text.slice(0, 300)}`)
    }
  }

  console.log('\n🎉 Done! Inbound media from leads should now appear in the CRM.')
}

reconfigureWebhook().catch(console.error)
